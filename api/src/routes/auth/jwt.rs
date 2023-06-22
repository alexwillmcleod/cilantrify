use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

#[derive(sqlx::FromRow, Deserialize, Serialize, Clone, Debug)]
pub struct UserClaims {
  pub id: i32,
  pub given_name: String,
  pub family_name: String,
}

impl UserClaims {
  pub fn new(id: i32, given_name: String, family_name: String) -> UserClaims {
    UserClaims {
      id,
      given_name,
      family_name,
    }
  }
  pub fn sign(self) -> Result<String, jwt::Error> {
    let key: Hmac<Sha256> = Hmac::new_from_slice(std::env::var("JWT_SECRET").unwrap().as_bytes())?;
    self.sign_with_key(&key)
  }
}

pub fn verify(token: String) -> Result<UserClaims, jwt::Error> {
  let key: Hmac<Sha256> = Hmac::new_from_slice(std::env::var("JWT_SECRET").unwrap().as_bytes())?;
  token.verify_with_key(&key)
}
