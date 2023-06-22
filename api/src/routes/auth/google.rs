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
  tracing::debug!(
    "Creating user with name email = {}, name = {} {}, picture = {:?}",
    &body.email.clone(),
    &body.given_name.clone(),
    &body.family_name.clone(),
    &body.picture.clone()
  );

  // We are going to try inserting
  // We will ignore the result
  let _ = sqlx::query!(
    r#"
        INSERT INTO users (email, given_name, family_name) 
        VALUES ($1, $2, $3) 
      "#,
    &body.email.clone(),
    &body.given_name.clone(),
    &body.family_name.clone(),
  )
  .fetch_one(&state.db)
  .await;

  let Ok(user) = sqlx::query_as!(
    UserClaims,
    r#"
      SELECT id, given_name, family_name
      FROM users
      WHERE email = $1
    "#,
    &body.email.clone()
  )
  .fetch_one(&state.db)
  .await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to upsert user")).into_response();
  };

  if let Some(picture) = &body.picture {
    match sqlx::query!(
      r#"
        UPDATE users
        SET picture = $1
        WHERE id = $2
      "#,
      picture,
      user.id
    )
    .execute(&state.db)
    .await
    {
      Ok(..) => {}
      Err(..) => {
        return (
          StatusCode::INTERNAL_SERVER_ERROR,
          String::from("failed to upload profile picture"),
        )
          .into_response();
      }
    }
  }

  match user.sign() {
    Ok(token) => (StatusCode::OK, token),
    Err(..) => (
      StatusCode::INTERNAL_SERVER_ERROR,
      String::from("could not create auth token"),
    ),
  }
  .into_response()
}
