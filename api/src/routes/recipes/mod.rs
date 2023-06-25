use crate::routes::auth::jwt::UserClaims;
use crate::AppState;
use axum::{
  body::Full,
  extract::{Json, Query, State},
  response::{IntoResponse, Response},
  routing::{get, post},
  Extension, Router,
};
use axum_macros::debug_handler;
use http::StatusCode;
use reqwest::ResponseBuilderExt;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::{
  collections::{HashMap, HashSet},
  sync::Arc,
};
use tracing_subscriber::field::debug;

pub fn recipe_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", post(create))
    .route("/", get(fetch))
    .route("/all", get(fetch_last))
}

#[allow(non_camel_case_types)]
#[derive(Debug, sqlx::Type, Deserialize, Serialize, Copy, Clone)]
#[sqlx(type_name = "measurement_unit")]
enum Unit {
  #[sqlx(rename = "mg")]
  mg,
  #[sqlx(rename = "g")]
  g,
  #[sqlx(rename = "kg")]
  kg,
  #[sqlx(rename = "mL")]
  mL,
  #[sqlx(rename = "L")]
  L,
  #[sqlx(rename = "units")]
  Units,
}

#[derive(sqlx::FromRow, Serialize, Deserialize, Debug)]
struct Ingredient {
  name: String,
  amount: f64,
  measurement: Unit,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateRecipeBody {
  title: String,
  description: Option<String>,
  ingredients: Vec<Ingredient>,
  instructions: Vec<String>,
  image: String,
}

#[derive(Serialize, Deserialize)]
struct RecipeFetchQuery {
  recipe_id: i32,
}

#[derive(Serialize, Deserialize)]
struct FullFetchedRecipe {
  title: String,
  id: i32,
  description: Option<String>,
  created_at: chrono::NaiveDateTime,
  picture: String,
  author_given_name: String,
  author_family_name:String,
  author_profile: Option<String>,
  instructions: Vec<String>,
  ingredients: Vec<Ingredient>,
}

#[derive(sqlx::FromRow, Deserialize, Serialize)]
struct RecipeWithoutIngredients {
  id: i32,
  title: String,
  description: Option<String>,
  created_at: chrono::NaiveDateTime,
  picture: String,
  author_given_name: String,
  author_family_name: String,
  author_profile: Option<String>,
  instructions: Vec<String>,
}

#[debug_handler]
async fn fetch(
  query: Query<RecipeFetchQuery>,
  State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
  let recipe_id = query.recipe_id;

  let Ok(recipe) = sqlx::query_as!(
    RecipeWithoutIngredients, 
    r#"
    SELECT 
      recipes.id AS "id",
      recipes.title AS "title",
      recipes.description AS "description",
      recipes.instructions AS "instructions", 
      recipes.created_at AS "created_at",
      recipes.picture AS "picture",
      users.given_name AS "author_given_name",
      users.family_name AS "author_family_name",
      users.picture AS "author_profile"
    FROM 
      recipes
      JOIN users ON recipes.author_id = users.id
    WHERE 
      recipes.id = $1
  "#, recipe_id)
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };

    // Let's look for the ingredients now
    let Ok(ingredients) = sqlx::query_as!(
      Ingredient,
      r#"
        SELECT 
          name,
          amount,
          unit AS "measurement: Unit"
        FROM 
          ingredients
        WHERE recipe_id = $1
      "#, 
      recipe.id
    ).fetch_all(&state.db).await else {
      return (StatusCode::NOT_FOUND, String::from("could not find ingredients")).into_response();
    };

  let res = FullFetchedRecipe {
    title: recipe.title,
    id: recipe.id,
    description: recipe.description,
    created_at: recipe.created_at,
    picture: recipe.picture,
    author_given_name: recipe.author_given_name,
    author_family_name: recipe.author_family_name,
    author_profile: recipe.author_profile,
    instructions: recipe.instructions,
    ingredients
  };

  (StatusCode::OK, axum::Json(Some(res))).into_response()
}

async fn create(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
  Json(body): Json<CreateRecipeBody>,
) -> Response {
  // We are going to create the recipe and add it to the database
  tracing::debug!("{:?}", body.ingredients);

  // Lets check there is a user
  // You must be authenticated to use this route
  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to create a recipe")).into_response();
  };

  let Ok(mut tmx) = state.db.begin().await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to start database transaction")).into_response();
  };

  let image_bb_apikey =
    std::env::var("IMAGE_BB_API_KEY").expect("Missing `IMAGE_BB_API_KEY` env var");

  // Now we've got to upload the image to imagebb
  let client = reqwest::Client::new();

  // Create request parameters
  let mut params = HashMap::new();
  params.insert("image", body.image);
  let request_body = client
    .post(format!(
      "https://api.imgbb.com/1/upload?key={}",
      image_bb_apikey
    ))
    .form(&params)
    .send()
    .await;

  let Ok(res) = request_body else {
  return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
};

  let Ok(data): Result<serde_json::Value, reqwest::Error> = res.json().await else {
  return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
};

  let Some(url_value): Option<&str> = data["data"]["image"]["url"].as_str() else {
  return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
};

let url = String::from(url_value);

// Let's create the recipe
// Let's create the ingredients
#[derive(sqlx::FromRow)]
struct RecipeIdWrapper {
  id: i32
}
let Ok(res) = sqlx::query_as!(
  RecipeIdWrapper,
  r#"
    INSERT INTO recipes (title, description, instructions, author_id, picture)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  "#,
    &body.title.clone(),
    body.description.clone(),
    &body.instructions.clone(),
    &user.id.clone(),
    url.clone()
  )
  .fetch_one(&mut tmx)
  .await else {
    tmx.rollback().await.unwrap();
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe")).into_response();
  };

  let recipe_id: i32 = res.id;

  for ingredient in body.ingredients {
    tracing::debug!("Adding ingredient {:?}", ingredient);
    let Ok(_row) = sqlx::query!(
      r#"
        INSERT INTO ingredients (recipe_id, name, amount, unit) 
        VALUES ($1, $2, $3, $4) 
      "#,
      &recipe_id.clone(),
      &ingredient.name, 
      &ingredient.amount, 
      ingredient.measurement as Unit
    ).execute(&mut tmx)
      .await else {
        tmx.rollback().await.unwrap();
        return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create ingredient")).into_response();
      };
  }


    tmx.commit().await.unwrap();

  (
    StatusCode::OK,
    format!("successfully created recipe {}", &body.title),
  )
    .into_response()
}

#[derive(Deserialize, Serialize)]
struct FetchedRecipe {
  id: i32,
  title: String,
  picture: Option<String>,
  author_first_name: Option<String>,
  author_last_name: Option<String>,
  author_profile: Option<String>,
}

#[debug_handler]
async fn fetch_last(State(state): State<Arc<AppState>>) -> impl IntoResponse {

  let mut res: Vec<FullFetchedRecipe> = Vec::new();

  let Ok(recipes) = sqlx::query_as!(
    RecipeWithoutIngredients, 
    r#"
    SELECT 
      recipes.id AS "id",
      recipes.title AS "title",
      recipes.description AS "description",
      recipes.instructions AS "instructions", 
      recipes.created_at AS "created_at",
      recipes.picture AS "picture",
      users.given_name AS "author_given_name",
      users.family_name AS "author_family_name",
      users.picture AS "author_profile"
    FROM 
      recipes
      JOIN users ON recipes.author_id = users.id
  "#)
    .fetch_all(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };


    for recipe in recipes {
      // Let's look for the ingredients now
      let Ok(ingredients) = sqlx::query_as!(
        Ingredient,
        r#"
          SELECT 
            name,
            amount,
            unit AS "measurement: Unit"
          FROM 
            ingredients
          WHERE recipe_id = $1
        "#, 
        recipe.id
      ).fetch_all(&state.db).await else {
        return (StatusCode::NOT_FOUND, String::from("could not find ingredients")).into_response();
      };

      let full_fetched_recipe = FullFetchedRecipe {
        title: recipe.title,
        id: recipe.id,
        description: recipe.description,
        created_at: recipe.created_at,
        picture: recipe.picture,
        author_given_name: recipe.author_given_name,
        author_family_name: recipe.author_family_name,
        author_profile: recipe.author_profile,
        instructions: recipe.instructions,
        ingredients
      };

      res.push(full_fetched_recipe);
    }

  (StatusCode::OK, axum::Json(Some(res))).into_response()
}
