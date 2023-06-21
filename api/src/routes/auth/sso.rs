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
  Router::new().route("/", post(continue_with_sso))
  // .route("/callback", post(continue_with_sso_callback))
}

#[derive(Deserialize, Serialize)]
struct ContinueWithSSOBody {
  email: String,
}

async fn continue_with_sso(
  State(state): State<Arc<AppState>>,
  Json(body): Json<ContinueWithSSOBody>,
) -> Response {
  dotenv().ok();
  let email_address = body.email;

  const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                          abcdefghijklmnopqrstuvwxyz\
                          0123456789)(*&^%$#@!~";
  const CODE_LEN: usize = 6;
  let mut rng = rand::thread_rng();

  let code: String = (0..CODE_LEN)
    .map(|_| {
      let idx = rng.gen_range(0..CHARSET.len());
      CHARSET[idx] as char
    })
    .collect();

  // let sign_in_code: sign_in_code::ActiveModel = sign_in_code::ActiveModel {
  //   email_address: Set(email_address.clone()),
  //   code: Set(code.clone()),
  //   ..Default::default()
  // };

  let insert_query = "INSERT INTO sign_in_code (email, code) VALUES ($1, $2)";
  let Ok(res) = sqlx::query(insert_query)
    .bind(email_address.clone())
    .bind(code.clone())
    .execute(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create sign in code")).into_response();
    };

  let email_message = Message::builder()
    .from("Alex @ Cilantrify <alex@cilantrify.com>".parse().unwrap())
    .to(email_address.clone().parse().unwrap())
    .subject("Verify Cilantrify Account")
    .header(ContentType::TEXT_PLAIN)
    .body(format!(
      "Hello! Great to have you on board. Finish up with https://cilantrify.com/auth/verify/{}",
      code
    ))
    .unwrap();

  let smpt_user =
    std::env::var("SMTP_USER").expect("SMTP_USER must be set as an environment variable");

  let smpt_pass =
    std::env::var("SMTP_PASS").expect("SMTP_PASS must be set as an environment variable");

  // let smtp_host =
  // std::env::var("SMTP_HOST").expect("SMTP_HOST msut be set as an environment variable");

  let creds = Credentials::new(smpt_user, smpt_pass);

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
struct ContinueWithSSOCallbackBody {
  code: String,
  email: String,
  name: String,
  given_name: String,
  family_name: String,
}

async fn continue_with_sso_callback(
  State(state): State<Arc<AppState>>,
  Json(body): Json<ContinueWithSSOCallbackBody>,
) -> Response {
  // Let's find the code
  let select_query =
    "SELECT (email) FROM sign_in_code WHERE code = $1 AND expires_at < $2 AND email = $3";
  let Ok(code_row) = sqlx::query(select_query)
    .bind(&body.code.clone())
    .bind(Utc::now().naive_utc())
    .bind(&body.email.clone())
    .fetch_one(&state.db)
    .await else {
    return (StatusCode::NOT_FOUND, String::from("could not find code")).into_response();
  };

  let upsert_query = "UPSERT INTO users (email, given_name, family_name) VALUES ($1, $2, $3)";
  let Ok(_) = sqlx::query(upsert_query)
    .bind(&body.email.clone())
    .bind(&body.given_name.clone())
    .bind(&body.family_name.clone())
    .execute(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upsert user into database")).into_response();
    };

  let select_query = "SELECT * FROM users WHERE email = $1";

  let Ok(user) = sqlx::query(select_query)
    .bind(&body.email.clone())
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("user with that email not found")).into_response()
    };

  let Ok(token) =
    UserClaims::new(
      user.get("id"),
      user.get("given_name"),
       user.get("family_name")
    ).sign() else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not create session token")).into_response();
    };

  (StatusCode::OK, token).into_response()
}
