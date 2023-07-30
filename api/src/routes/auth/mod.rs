pub mod google;
pub mod jwt;
pub mod sso;

use crate::AppState;
use axum::{
  extract::{Extension, State},
  http::StatusCode,
  response::{IntoResponse, Json, Response},
  routing::get,
  Router,
};
use axum_macros::debug_handler;
use chrono::DateTime;
use google::google_routes;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use sso::sso_routes;
use std::sync::Arc;

use self::jwt::UserClaims;

#[derive(sqlx::FromRow, Serialize, Deserialize, Debug)]
pub struct User {
  pub picture: Option<String>,
  pub email: String,
  pub given_name: String,
  pub family_name: String,
  pub bio: Option<String>,
  pub id: i32,
}

pub fn auth_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/info", get(user_info))
    .nest("/google", google_routes())
    .nest("/sso", sso_routes())
}

async fn user_info(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
) -> Response {
  let Some(user) = user_claims else {
    return Json(None::<User>).into_response();
  };

  let Ok(user) = sqlx::query_as!(
    User, 
    "SELECT picture, email, family_name, given_name, id, bio FROM users WHERE id = $1",
    &user.id
  )
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not find user")).into_response();
    };
  (StatusCode::OK, Json(Some(user))).into_response()
}
