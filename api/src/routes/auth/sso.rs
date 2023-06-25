// Endpoint to create an account with email (passwordless)
// Endpoint to sign in with email (passwordless)
// Endpoint to sign in with Google
// Endpoint to sign in with Google endpoint

use axum::{
  extract::{Json, Query, State},
  http::StatusCode,
  response::{IntoResponse, Redirect, Response},
  routing::post,
  Router,
};
use axum_macros::debug_handler;
use axum_sessions::extractors::WritableSession;
use chrono::{DateTime, Days, Utc};
use dotenvy::dotenv;
use hmac::{Hmac, Mac};
use jwt::{AlgorithmType, Header, SignWithKey, Token, VerifyWithKey};

use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use sqlx::Row;
use std::sync::Arc;

use crate::{routes::auth::User, AppState};

use super::jwt::UserClaims;

pub fn sso_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", post(continue_with_sso))
    .route("/sign-in", post(sign_in))
    .route("/create", post(create_account))
}

#[derive(Deserialize, Serialize)]
struct ContinueWithSSOBody {
  email: String,
}

fn generate_random_code() -> i32 {
  let mut rng = rand::thread_rng();
  rng.gen_range(100_000..1_000_000)
}

#[debug_handler]
async fn continue_with_sso(
  State(state): State<Arc<AppState>>,
  Json(body): Json<ContinueWithSSOBody>,
) -> axum::response::Response {
  dotenv().ok();
  let email_address = body.email.clone();
  let code = generate_random_code();

  let res = sqlx::query!(
    r#"INSERT INTO sign_in_codes (email, code) VALUES ($1, $2)"#,
    &email_address.clone(),
    &code
  )
  .execute(&state.db)
  .await;

  if res.is_err() {
    return (
      StatusCode::INTERNAL_SERVER_ERROR,
      String::from("could not create sign in code"),
    )
      .into_response();
  }

  let Ok(email_message) = Message::builder()
    .from("Alex @ Cilantrify <alex@cilantrify.com>".parse().unwrap())
    .to(email_address.clone().parse().unwrap())
    .subject("Verify Cilantrify Account")
    .header(ContentType::TEXT_PLAIN)
    .body(format!(
      "Hello! Great to have you on board. Your code is {}",
      &code
    )) else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not write email")).into_response();
    };

  let smtp_user =
    std::env::var("SMTP_USER").expect("SMTP_USER must be set as an environment variable");

  let smtp_pass =
    std::env::var("SMTP_PASS").expect("SMTP_PASS must be set as an environment variable");

  // let smtp_host =
  // std::env::var("SMTP_HOST").expect("SMTP_HOST msut be set as an environment variable");

  let creds = Credentials::new(smtp_user, smtp_pass);

  let mailer = SmtpTransport::relay("smtp.gmail.com")
    .unwrap()
    .credentials(creds)
    .build();

  match mailer.send(&email_message) {
    Ok(_) => (
      StatusCode::OK,
      format!("email sent to {} successfully", email_address.clone()),
    )
      .into_response(),
    Err(e) => {
      tracing::debug!("failed to send email to {}", email_address.clone());
      tracing::debug!("{}", e); // Log error
      (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to send email"),
      )
        .into_response()
    }
  }
}

#[derive(Deserialize, Debug)]
struct CreateAccountBody {
  code: i32,
  email: String,
  given_name: String,
  family_name: String,
}

async fn create_account(
  State(state): State<Arc<AppState>>,
  Json(body): Json<CreateAccountBody>,
) -> Response {
  // Let's find the code
  let Ok(Some(_)) = sqlx::query!(
    r#"
      SELECT sign_in_codes.id
      FROM 
        sign_in_codes
      WHERE code = $1 AND expires_at > $2 AND email = $3
    "#,
    &body.code.clone(),
    Utc::now().naive_utc(),
    &body.email.clone()
  )
    .fetch_optional(&state.db)
    .await else {
    return (StatusCode::UNAUTHORIZED, String::from("invalid code")).into_response();
  };

  match sqlx::query!(
    r#"
        INSERT INTO users (email, given_name, family_name) 
        VALUES ($1, $2, $3) 
      "#,
    &body.email.clone(),
    &body.given_name.clone(),
    &body.family_name.clone(),
  )
  .execute(&state.db)
  .await
  {
    Ok(..) => {}
    Err(..) => {
      return (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to create user"),
      )
        .into_response()
    }
  }

  #[derive(sqlx::FromRow)]
  struct UserRow {
    id: i32,
    given_name: String,
    family_name: String,
  }

  let Ok(user) = sqlx::query_as!(
    UserRow,
    r#"
      SELECT id, given_name, family_name
      FROM users
      WHERE email = $1
    "#,
    &body.email.clone()
  )
  .fetch_one(&state.db)
  .await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create user")).into_response();
  };
  let Ok(token) =
    UserClaims::new(user.id, user.given_name, user.family_name).sign() else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create session token")).into_response();
    };

  (StatusCode::OK, token).into_response()
}

#[derive(Deserialize, Debug)]
struct SignInBody {
  code: i32,
  email: String,
}

async fn sign_in(State(state): State<Arc<AppState>>, Json(body): Json<SignInBody>) -> Response {
  // Let's find the code
  let Ok(Some(_)) = sqlx::query!(
    r#"
      SELECT sign_in_codes.id
      FROM 
        sign_in_codes
      WHERE code = $1 AND expires_at > $2 AND email = $3
    "#,
    &body.code.clone(),
    Utc::now().naive_utc(),
    &body.email.clone()
  )
    .fetch_optional(&state.db)
    .await else {
    return (StatusCode::UNAUTHORIZED, String::from("invalid code")).into_response();
  };
  #[derive(sqlx::FromRow)]
  struct UserRow {
    id: i32,
    given_name: String,
    family_name: String,
  }

  let Ok(user) = sqlx::query_as!(
    UserRow,
    r#"
      SELECT id, given_name, family_name
      FROM users
      WHERE email = $1
    "#,
    &body.email.clone()
  )
  .fetch_one(&state.db)
  .await else {
    return (StatusCode::NOT_FOUND, String::from("failed to find user")).into_response();
  };
  let Ok(token) =
    UserClaims::new(user.id, user.given_name, user.family_name).sign() else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create session token")).into_response();
    };

  (StatusCode::OK, token).into_response()
}
