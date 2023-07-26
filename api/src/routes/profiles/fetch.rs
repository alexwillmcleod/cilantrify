use std::sync::Arc;

use axum::{
  extract::{Query, State},
  response::{Response, Json, IntoResponse},
  http::StatusCode
};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Deserialize, Serialize, Debug)]
pub struct FetchProfileQuery {
  profile_id: i32,
}

#[derive(sqlx::FromRow, Serialize, Deserialize, Debug)]
pub struct User {
  pub picture: Option<String>,
  pub email: String,
  pub given_name: String,
  pub family_name: String,
  pub id: i32,
}
pub async fn fetch(
  Query(query): Query<FetchProfileQuery>,
  State(state): State<Arc<AppState>>,
) -> Response {
  let profile_id = query.profile_id;


  let Ok(user) = sqlx::query_as!(
    User, 
    "SELECT picture, email, family_name, given_name, id FROM users WHERE id = $1",
    &profile_id
  )
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not find user")).into_response();
    };
  (StatusCode::OK, Json(Some(user))).into_response()

}
