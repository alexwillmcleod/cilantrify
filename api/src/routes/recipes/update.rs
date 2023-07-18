use std::{sync::Arc, collections::HashMap};

use axum::{http::StatusCode, Extension, extract::State, Json, response::{Response, IntoResponse}};
use serde::{Deserialize, Serialize};

use crate::{AppState, routes::auth::jwt::UserClaims};

use super::{Ingredient, Unit};


#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateRecipeBody {
  id: i32,
  title: Option<String>,
  description: Option<Option<String>>,
  ingredients: Option<Vec<Ingredient>>,
  instructions: Option<Vec<String>>,
  image: Option<String>,
}

pub async fn update(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
  Json(body): Json<UpdateRecipeBody>
) -> Response {
  // We are going to create the recipe and add it to the database
  tracing::debug!("{:?}", body.ingredients);

  // Lets check there is a user
  // You must be authenticated to use this route
  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to update a recipe")).into_response();
  };

  let Ok(_) = sqlx::query!(
    r#"
      SELECT * FROM recipes WHERE author_id = $1 AND id = $2
    "#,
    user.id,
    &body.id.clone()
  ).fetch_one(&state.db).await else {
    return (StatusCode::UNAUTHORIZED, String::from("must be signed in as the author to edit this recipe")).into_response();
  };

  let Ok(mut tmx) = state.db.begin().await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to start database transaction")).into_response();
  };

  let url = match body.image {
    Some(image) => {
    let image_bb_apikey =
      std::env::var("IMAGE_BB_API_KEY").expect("Missing `IMAGE_BB_API_KEY` env var");

    // Now we've got to upload the image to imagebb
    let client = reqwest::Client::new();

    // Create request parameters
    let mut params = HashMap::new();
    params.insert("image", image);
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

    Some(String::from(url_value))
    },
    None => None
 };

  match body.description {
    Some(description) => {
      let instructions = body.instructions.clone();
      let Ok(_) = sqlx::query!(
          r#"
            UPDATE 
              recipes 
            SET 
              title = COALESCE($2, title),
              description = COALESCE($3, description),
              instructions = COALESCE($4, instructions),
              picture = COALESCE($5, picture)
            WHERE id = $1
          "#,
            &body.id.clone(),
            body.title.clone(),
            description.clone(),
            instructions.as_deref(),
            url.clone()
        )
        .execute(&mut tmx)
        .await else {
          tmx.rollback().await.unwrap();
          return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe")).into_response();
        };
    },
    None => {
      let instructions = body.instructions.clone();
      let Ok(_) = sqlx::query!(
          r#"
            UPDATE 
              recipes 
            SET 
              title = COALESCE($2, title),
              instructions = COALESCE($3, instructions),
              picture = COALESCE($4, picture)
            WHERE id = $1
          "#,
            &body.id.clone(),
            body.title.clone(),
            instructions.as_deref(),
            url.clone()
        )
        .execute(&mut tmx)
        .await else {
          tmx.rollback().await.unwrap();
          return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe")).into_response();
        };

    }
  }
  // Delete pre existing ingredients
  match sqlx::query!(
    r#"
      DELETE FROM 
        ingredients
      WHERE 
        recipe_id = $1 
    "#,
    &body.id.clone() 
  ).execute(&mut tmx).await {
    Ok(..) => {},
    Err(err) => {
      tmx.rollback().await.unwrap();
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to update ingredients")).into_response()
    } 
  }

  if let Some(ingredients) = body.ingredients {
    for ingredient in ingredients {
      tracing::debug!("Adding ingredient {:?}", ingredient);
      let Ok(_row) = sqlx::query!(
        r#"
          INSERT INTO ingredients (recipe_id, name, amount, unit) 
          VALUES ($1, $2, $3, $4) 
        "#,
        &body.id.clone(),
        &ingredient.name, 
        &ingredient.amount, 
        ingredient.measurement as Unit
      ).execute(&mut tmx)
        .await else {
          tmx.rollback().await.unwrap();
          return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create ingredient")).into_response();
        };
    }
  }

    tmx.commit().await.unwrap();

    (
      StatusCode::OK,
      String::from("successfully updated recipe")
    )
      .into_response()
}


