use std::{sync::Arc, collections::HashMap};

use axum::{http::StatusCode, Extension, extract::State, Json, response::{Response, IntoResponse}};
use serde::{Deserialize, Serialize};

use crate::{AppState, routes::auth::jwt::UserClaims};

use super::{Ingredient, Unit};



#[derive(Serialize, Deserialize, Debug)]
pub struct CreateRecipeBody {
  title: String,
  description: Option<String>,
  ingredients: Vec<Ingredient>,
  instructions: Vec<String>,
  image: String,
}

pub async fn create(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
  Json(body): Json<CreateRecipeBody>
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

