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
  // .route("/page", get(fetch_last))
}

#[derive(Serialize, Deserialize, Debug)]
struct Ingredient {
  name: String,
  amount: i32,
  measurement: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateRecipeBody {
  title: String,
  ingredients: Vec<Ingredient>,
  instructions: Vec<String>,
  image: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct RecipeFetchQuery {
  recipe_id: i32,
}

#[derive(Serialize, Deserialize)]
struct FullFetchedRecipe {
  title: String,
  picture: Option<String>,
  author_first_name: Option<String>,
  author_last_name: Option<String>,
  author_profile: Option<String>,
  instructions: Vec<String>,
  ingredients: Vec<Ingredient>,
}

#[debug_handler]
async fn fetch(
  query: Query<RecipeFetchQuery>,
  State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
  let recipe_id = query.recipe_id;

  let select_query = r#"
    SELECT 
      recipes.id AS "recipe.id",
      recipes.title AS "recipe.title",
      recipes.description AS "recipe.description",
      recipes.instructions AS "recipe.instructions", 
      recipes.created_at AS "recipe.created_at",
      recipes.picture AS "recipe.picture",
      users.given_name AS "user.given_name",
      users.family_name AS "user.family_name",
      users.picture AS "user.picture",
      ingredients.name AS "ingredient.name",
      ingredients.amount AS "ingredient.amount",
      ingredients.unit AS "ingredient.unit",
    FROM 
      recipes
      JOIN users ON users.id = recipe.author_id,
      JOIN ingredients ON ingredients.id = ANY(recipe.ingredients)
    WHERE 
      recipes.id = $1
  "#;

  let Ok(Some(recipe)) = sqlx::query(select_query)
    .bind(&recipe_id)
    .fetch_optional(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };

  // let res = FullFetchedRecipe {
  //   title: recipe.get("recipe.id"),
  //   picture: recipe.get("recipe.picture"),
  //   author_first_name: recipe.get("user.given_name"),
  //   author_last_name: recipe.get("user.family_name"),
  //   author_profile: recipe.get("user.picture"),
  //   instructions: recipe.get("user.instructions"),
  //   // ingredients: recipe.get("ingredients"),
  // };

  // let res = FullFetchedRecipe {
  //   title: recipe.0.title,
  //   picture: recipe.0.picture,
  //   author_first_name: match &recipe.1 {
  //     Some(user) => Some(user.given_name.clone()),
  //     None => None,
  //   },
  //   author_last_name: match &recipe.1 {
  //     Some(user) => Some(user.family_name.clone()),
  //     None => None,
  //   },
  //   author_profile: match &recipe.1 {
  //     Some(user) => user.picture.clone(),
  //     None => None,
  //   },
  //   instructions: recipe.0.instructions,
  //   ingredients: ingredients
  //     .iter()
  //     .map(|element| Ingredient {
  //       name: element.name.clone(),
  //       amount: element.amount.clone(),
  //       measurement: element.measurement.to_string(),
  //     })
  //     .collect::<Vec<Ingredient>>(),
  // };

  // (StatusCode::OK, axum::Json(Some(res)))
  todo!()
}

async fn create(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
  Json(body): Json<CreateRecipeBody>,
) -> Response {
  // We are going to create the recipe and add it to the database

  // Lets check there is a user
  // You must be authenticated to use this route
  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to create a recipe")).into_response();
  };

  // Let's check every measurement string is valid
  for ingredient in &body.ingredients {
    if !["g", "mg", "kg", "mL", "L", "units"]
      .iter()
      .map(|&x| x.to_string())
      .collect::<HashSet<String>>()
      .contains(&ingredient.measurement)
    {
      return (
        StatusCode::BAD_REQUEST,
        format!("{} is not a valid measurement unit", ingredient.measurement),
      )
        .into_response();
    }
  }

  // Every measurement unit is valid

  let mut url: Option<String> = None;
  if let Some(img) = body.image {
    let image_bb_apikey =
      std::env::var("IMAGE_BB_API_KEY").expect("Missing `IMAGE_BB_API_KEY` env var");

    // Now we've got to upload the image to imagebb
    let client = reqwest::Client::new();

    // Create request parameters
    let mut params = HashMap::new();
    params.insert("image", img);
    let body = client
      .post(format!(
        "https://api.imgbb.com/1/upload?key={}",
        image_bb_apikey
      ))
      .form(&params)
      .send()
      .await;

    let Ok(res) = body else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
  };

    let Ok(data): Result<serde_json::Value, reqwest::Error> = res.json().await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
  };

    let Some(url_value): Option<&str> = data["data"]["image"]["url"].as_str() else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
  };

    url = Some(String::from(url_value));
  }

  // Let's create the recipe
  // Let's create the ingredients
  let insert_ingredient_query =
    "INSERT INTO ingredients (name, amount, unit) VALUES ($1, $2, $3) RETURNING id";
  let mut ingredients_list: Vec<i32> = vec![];
  for ingredient in &body.ingredients {
    let Ok(row) = sqlx::query(insert_ingredient_query)
      .bind(&ingredient.name)
      .bind(&ingredient.amount)
      .bind(&ingredient.measurement)
      .fetch_one(&state.db)
      .await else {
        return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create ingredient")).into_response();
      };
    let id: i32 = row.get("id");
    ingredients_list.push(id);
  }

  let insert_query =
    "INSERT INTO recipes (title, description, instructions, ingredients, picture) VALUES ($1, $2, $3, $4, $5)";
  let Ok(res) = sqlx::query(insert_query)
    .bind(&body.title.clone())
    .bind(&body.instructions.clone())
    .bind(&user.id.clone())
    .bind(&ingredients_list)
    .bind(&url.clone())
    .execute(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe")).into_response();
    };

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

// #[debug_handler]
// async fn fetch_last(State(state): State<Arc<AppState>>) -> impl IntoResponse {
//   let cursor = recipe::Entity::find()
//     .find_also_related(user::Entity)
//     .paginate(&state.db, 20);
//   match cursor.fetch().await {
//     Ok(values) => (
//       StatusCode::OK,
//       axum::Json(
//         values
//           .iter()
//           .map(|(recipe, user)| FetchedRecipe {
//             id: recipe.id.clone(),
//             title: recipe.title.clone(),
//             picture: recipe.picture.clone(),
//             author_first_name: match user {
//               Some(author) => Some(author.given_name.clone()),
//               None => None,
//             },
//             author_last_name: match user {
//               Some(author) => Some(author.family_name.clone()),
//               None => None,
//             },
//             author_profile: match user {
//               Some(author) => author.picture.clone(),
//               None => None,
//             },
//           })
//           .collect::<Vec<FetchedRecipe>>(),
//       ),
//     ),
//     Err(..) => (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(vec![])),
//   }
// }
