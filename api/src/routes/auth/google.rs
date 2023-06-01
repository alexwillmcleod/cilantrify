// Endpoint to create an account with email (passwordless)
// Endpoint to sign in with email (passwordless)
// Endpoint to sign in with Google
// Endpoint to sign in with Google endpoint

use crate::routes::auth::jwt::UserClaims;
use axum::{
  extract::{Json, State},
  http::StatusCode,
  response::Redirect,
  routing::{get, post},
  Router,
};
use axum_macros::debug_handler;
use entity::entities::user;
use oauth2::{AuthorizationCode, CsrfToken, Scope, TokenResponse};
use reqwest::Client;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{routes::auth::User, AppState};

pub fn google_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", get(continue_with_google))
    .route("/callback", post(continue_with_google_callback))
}

async fn continue_with_google(
  State(state): State<Arc<AppState>>,
) -> axum::response::Result<axum::response::Redirect> {
  let (auth_url, _csrf_token) = state
    .google_oauth_client
    .authorize_url(CsrfToken::new_random)
    .add_scope(Scope::new("profile".to_string()))
    .add_scope(Scope::new("email".to_string()))
    .url();

  Ok(Redirect::to(&auth_url.to_string()))
}

#[derive(Deserialize, Debug)]
struct ContinueWithGoogleCallback {
  code: String,
}

#[debug_handler]
async fn continue_with_google_callback(
  State(state): State<Arc<AppState>>,
  Json(query): Json<ContinueWithGoogleCallback>,
) -> (StatusCode, String) {
  // Exchange the code
  let token = state
    .google_oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(oauth2::reqwest::async_http_client)
    .await
    .unwrap();

  tracing::debug!("exchanged token, {}", token.access_token().secret());

  let client: Client = Client::new();
  let body = client
    .get("https://www.googleapis.com/oauth2/v3/userinfo")
    .bearer_auth(token.access_token().secret())
    .send()
    .await
    .unwrap()
    .json::<User>()
    .await
    .unwrap();

  if let Some(user) = user::Entity::find()
    .filter(user::Column::Email.eq(body.email.clone()))
    .all(&state.db)
    .await
    .unwrap()
    .get(0)
  {
    let Ok(token) =
      UserClaims::new(user.id, user.given_name.clone(), user.family_name.clone()).sign() else {
        return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create session token"));
      };

    return (StatusCode::OK, token);
  }

  let new_user = user::ActiveModel {
    email: Set(body.email.clone()),
    family_name: Set(body.family_name.clone()),
    given_name: Set(body.given_name.clone()),
    picture: Set(body.picture.clone()),
    ..Default::default()
  };
  match new_user.insert(&state.db).await {
    Ok(user) => {
      let Ok(token) = UserClaims::new(user.id, user.given_name.clone(), user.family_name.clone()).sign() else {
        return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create session token"));
      };
      (StatusCode::OK, token)
    }
    Err(k) => {
      tracing::debug!("server error: {}", k);
      (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to create user"),
      )
    }
  }
}
