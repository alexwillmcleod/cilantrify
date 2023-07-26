pub mod fetch;
pub mod update;

use std::sync::Arc;

use axum::{
  http::StatusCode,
  response::{IntoResponse, Response},
  routing::{get, put},
  Router,
};
use axum_macros::debug_handler;
use crate::AppState;

pub fn profile_routes() -> Router<Arc<AppState>> {
  Router::new().route("/", get(index)).route(
    "/update-profile-picture",
    put(update::update_profile_picture),
  )
}

#[debug_handler]
async fn index() -> Response {
  (StatusCode::OK, String::from("Hello, from profiles")).into_response()
}
