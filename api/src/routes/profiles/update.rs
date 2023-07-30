use std::{collections::HashMap, sync::Arc};

use axum::{
  extract::State,
  http::StatusCode,
  response::{IntoResponse, Response},
  Extension, Json,
};
use axum_macros::debug_handler;
use serde::Deserialize;

use crate::{routes::auth::jwt::UserClaims, AppState};

#[derive(Deserialize)]
pub struct UpdateProfileBioBody {
  bio: String,
}

#[debug_handler]
pub async fn update_profile_bio(
  State(state): State<Arc<AppState>>,
  Extension(user_claims): Extension<Option<UserClaims>>,
  Json(body): Json<UpdateProfileBioBody>,
) -> Response {
  tracing::debug!("{:?}", user_claims);

  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to update your profile bio")).into_response();
  };

  match sqlx::query!(
    r#"
      UPDATE 
        users
      SET bio = $1
      WHERE users.id = $2
    "#,
    body.bio,
    user.id
  )
  .execute(&state.db)
  .await
  {
    Ok(..) => (
      StatusCode::OK,
      String::from("successfully updated user bio"),
    )
      .into_response(),
    Err(err) => {
      tracing::debug!("{:?}", err);
      (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to update bio"),
      )
        .into_response()
    }
  }
}

#[derive(Deserialize)]
pub struct UpdateProfilePictureBody {
  image: String,
}

#[debug_handler]
pub async fn update_profile_picture(
  State(state): State<Arc<AppState>>,
  Extension(user_claims): Extension<Option<UserClaims>>,
  Json(body): Json<UpdateProfilePictureBody>,
) -> Response {
  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to update your profile picture")).into_response();
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
    tracing::debug!("{:?}", request_body);
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image")).into_response();
  };

  let Ok(data): Result<serde_json::Value, reqwest::Error> = res.json().await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not extract response data")).into_response();
  };

  let Some(url_value): Option<&str> = data["data"]["image"]["url"].as_str() else {
    tracing::debug!("{:?}", data["data"]["image"]);
    tracing::debug!("{:?}", data["data"]);
    tracing::debug!("{:?}", data);
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not extract url data")).into_response();
  };

  let url = String::from(url_value);
  tracing::debug!("Updating profile picture for user with id {}", user.id);

  match sqlx::query!(
    r#"
      UPDATE 
        users
      SET picture = $1
      WHERE users.id = $2
    "#,
    Some(url),
    user.id
  )
  .execute(&state.db)
  .await
  {
    Ok(..) => (
      StatusCode::OK,
      String::from("successfully updated user profile picture"),
    )
      .into_response(),
    Err(err) => {
      tracing::debug!("{:?}", err);
      (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to update profile picture"),
      )
        .into_response()
    }
  }
}
