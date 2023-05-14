mod google;
mod sso;

use crate::AppState;
use axum::Router;
use google::google_routes;
use serde::{Deserialize, Serialize};
use sso::sso_routes;
use std::sync::Arc;

pub fn auth_routes() -> Router<Arc<AppState>> {
  Router::new()
    .nest("/google", google_routes())
    .nest("/sso", sso_routes())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
  pub picture: Option<String>,
  pub email: String,
  pub name: String,
  pub given_name: String,
  pub family_name: String,
}
