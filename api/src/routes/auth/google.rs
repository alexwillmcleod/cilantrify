// Endpoint to create an account with email (passwordless)
// Endpoint to sign in with email (passwordless)
// Endpoint to sign in with Google
// Endpoint to sign in with Google endpoint

use crate::routes::auth::jwt::UserClaims;
use axum::{
  extract::{Json, State},
  http::StatusCode,
  response::{IntoResponse, Redirect},
  routing::{get, post},
  Router,
};
use axum_macros::debug_handler;
use oauth2::{AuthorizationCode, CsrfToken, Scope, TokenResponse};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::Row;
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
) -> axum::response::Response {
  // Exchange the code
  let token = state
    .google_oauth_client
    .exchange_code(AuthorizationCode::new(query.code.clone()))
    .request_async(oauth2::reqwest::async_http_client)
    .await
    .unwrap();

  tracing::debug!("exchanged token, {}", token.access_token().secret());

  let client: Client = Client::new();
  let Ok(body) = client
    .get("https://www.googleapis.com/oauth2/v3/userinfo")
    .bearer_auth(token.access_token().secret())
    .send()
    .await
    .unwrap()
    .json::<User>()
    .await else {
      return (StatusCode::BAD_GATEWAY, String::from("invalid code")).into_response();
    };

  // We are going to try and find the user
  // If the users exists
  //   Create a token
  // Else
  //   Add the user to the database
  //   Create the token

  let upsert_query =
    "UPSERT INTO users (email, given_name, family_name, picture) VALUES ($1, $2, $3, $4)";
  let Ok(_) = sqlx::query(upsert_query)
    .bind(&body.email.clone())
    .bind(&body.given_name.clone())
    .bind(&body.family_name.clone())
    .bind(&body.picture.clone())
    .execute(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upsert user into database")).into_response();
    };

  let select_query = "SELECT id, given_name, family_name FROM users WHERE email = $1";
  let Ok(user) = sqlx::query(select_query)
    .bind(&body.email.clone())
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not find user")).into_response();
    };
  let Ok(token) = UserClaims::new(
    user.get("email"),
    user.get("given_name"),
    user.get("family_name"),
  )
  .sign() else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create auth token")).into_response();
  };

  (StatusCode::OK, token).into_response()
}
