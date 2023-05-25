pub mod google;
pub mod jwt;
pub mod sso;

use crate::AppState;
use axum::{
  extract::{Extension, State},
  http::StatusCode,
  response::{IntoResponse, Json},
  routing::get,
  Router,
};
use axum_macros::debug_handler;
use entity::entities::user;
use google::google_routes;
use sea_orm::EntityTrait;
use serde::{Deserialize, Serialize};
use sso::sso_routes;
use std::sync::Arc;

use self::jwt::UserClaims;

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
  pub picture: Option<String>,
  pub email: String,
  pub name: String,
  pub given_name: String,
  pub family_name: String,
}

pub fn auth_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/info", get(user_info))
    .nest("/google", google_routes())
    .nest("/sso", sso_routes())
}

#[debug_handler]
async fn user_info(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
  let Some(user) = user_claims else {
    return Json(None);
  };
  let user_list = user::Entity::find_by_id(user.id)
    .all(&state.db)
    .await
    .unwrap();
  let Some(user) = user_list.first() else {
    return Json(None);
  };
  Json(Some(user.clone()))
}
