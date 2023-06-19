// Endpoint to create an account with email (passwordless)
// Endpoint to sign in with email (passwordless)
// Endpoint to sign in with Google
// Endpoint to sign in with Google endpoint

use axum::{
  extract::{Json, Query, State},
  http::StatusCode,
  response::Redirect,
  routing::post,
  Router,
};
use axum_sessions::extractors::WritableSession;
use dotenvy::dotenv;
use entity::entities::user;
use hmac::{Hmac, Mac};
use jwt::{AlgorithmType, Header, SignWithKey, Token, VerifyWithKey};

use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::sync::Arc;

use crate::{routes::auth::User, AppState};

use super::jwt::UserClaims;

pub fn sso_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", post(continue_with_sso))
    .route("/callback", post(continue_with_sso_callback))
}

#[derive(Deserialize, Serialize)]
struct ContinueWithSSOBody {
  email: String,
}

async fn continue_with_sso(
  // State(state): State<Arc<AppState>>,
  Json(body): Json<ContinueWithSSOBody>,
) -> (StatusCode, String) {
  dotenv().ok();
  let email_address = body.email;

  let key_string: String =
    std::env::var("JWT_SECRET").expect("JWT_SECRET must be set as an environment variable");
  let key: Hmac<Sha256> = Hmac::new_from_slice(key_string.as_bytes()).unwrap();
  let claims = ContinueWithSSOBody {
    email: email_address.clone(),
  };
  let token_string: String = claims.sign_with_key(&key).unwrap().replace(".", "%2E");

  let email_message = Message::builder()
    .from("Alex @ Cilantrify <alex@cilantrify.com>".parse().unwrap())
    .to(email_address.clone().parse().unwrap())
    .subject("Verify Cilantrify Account")
    .header(ContentType::TEXT_PLAIN)
    .body(format!(
      "Hello! Great to have you on board. Finish up with https://cilantrify.com/auth/verify/{}",
      token_string
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
    ),
    Err(e) => {
      tracing::debug!("failed to send email to {}", email_address.clone());
      tracing::debug!("{}", e); // Log error
      (
        StatusCode::INTERNAL_SERVER_ERROR,
        String::from("failed to send email"),
      )
    }
  }
}

#[derive(Deserialize, Debug)]
struct ContinueWithSSOCallbackBody {
  code: String,
  name: String,
  given_name: String,
  family_name: String,
}

async fn continue_with_sso_callback(
  State(state): State<Arc<AppState>>,
  Json(body): Json<ContinueWithSSOCallbackBody>,
) -> (StatusCode, String) {
  // Exchange the code

  let code = body.code.clone();

  let key_string: String =
    std::env::var("JWT_SECRET").expect("JWT_SECRET must be set as an environment variable");
  let key: Hmac<Sha256> = Hmac::new_from_slice(key_string.as_bytes()).unwrap();

  let claims: ContinueWithSSOBody = match code.verify_with_key(&key) {
    Ok(claims) => claims,
    Err(..) => return (StatusCode::BAD_REQUEST, String::from("invalid token")),
  };

  // Let's create a user
  let user: User = User {
    picture: None,
    email: claims.email,
    name: body.name.clone(),
    given_name: body.given_name.clone(),
    family_name: body.family_name.clone(),
  };

  if let Some(user) = user::Entity::find()
    .filter(user::Column::Email.eq(user.email.clone()))
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
    email: Set(user.email.clone()),
    family_name: Set(body.family_name.clone()),
    given_name: Set(body.given_name.clone()),
    picture: Set(user.picture.clone()),
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
