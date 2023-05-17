mod google;
mod sso;

use crate::AppState;
use axum::{routing::get, Router, response::{Json, IntoResponse}, http::StatusCode};
use axum_sessions::extractors::ReadableSession;
use google::google_routes;
use serde::{Deserialize, Serialize};
use sso::sso_routes;
use std::sync::Arc;

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
    .nest("/google", google_routes())
    .nest("/sso", sso_routes())
    .route("/info", get(user_info))
}

async fn user_info(mut session: ReadableSession) -> impl IntoResponse {
  let Some(user) = session.get::<Option<User>>("user") else {
    return (StatusCode::NOT_FOUND, Json(None))
  };
  (StatusCode::OK, Json(user)) 
}
