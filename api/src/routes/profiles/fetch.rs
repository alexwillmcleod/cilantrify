use std::sync::Arc;

use axum::{
  extract::{Query, State},
  response::Response,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Deserialize, Serialize, Debug)]
pub struct FetchProfileQuery {
  profile_id: i32,
}

pub async fn fetch(
  Query(query): Query<FetchProfileQuery>,
  State(state): State<Arc<AppState>>,
) -> Response {

  let profile_id = query.profile_id;

  todo!()
}
