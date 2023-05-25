use crate::routes::auth::jwt::UserClaims;
use crate::AppState;
use axum::{response::IntoResponse, routing::get, Extension, Router};
use std::sync::Arc;

pub fn recipe_routes() -> Arc<Router<AppState>> {
  Router::new().route("/")
}

pub fn create(Extension(Some(user_claims)): Extension<Option<UserClaims>>) -> impl IntoResponse {}
