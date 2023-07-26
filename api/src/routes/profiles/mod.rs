pub mod fetch;
pub mod update;

use std::sync::Arc;

use crate::AppState;
use axum::{
  http::StatusCode,
  response::{IntoResponse, Response},
  routing::{get, put},
  Router,
};
use axum_macros::debug_handler;

pub fn profile_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route(
      "/update-profile-picture",
      put(update::update_profile_picture),
    )
    .route("/", get(fetch::fetch))
}
