pub mod create;
pub mod delete;
pub mod fetch;
pub mod search;
pub mod update;

use crate::AppState;
use axum::{
  routing::{delete, get, post, put},
  Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub fn recipe_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", post(create::create))
    .route("/", get(fetch::fetch))
    .route("/", delete(delete::delete_recipe))
    .route("/search", get(search::search_paginated))
    .route("/edit", put(update::update))
    .route("/socket", get(search::search_handler))
}

#[allow(non_camel_case_types)]
#[derive(Debug, sqlx::Type, Deserialize, Serialize, Copy, Clone)]
#[sqlx(type_name = "measurement_unit")]
pub enum Unit {
  #[sqlx(rename = "mg")]
  mg,
  #[sqlx(rename = "g")]
  g,
  #[sqlx(rename = "kg")]
  kg,
  #[sqlx(rename = "mL")]
  mL,
  #[sqlx(rename = "L")]
  L,
  #[sqlx(rename = "units")]
  Units,
}

#[derive(sqlx::FromRow, Serialize, Deserialize, Debug)]
pub struct Ingredient {
  name: String,
  amount: f64,
  measurement: Unit,
}

#[derive(Serialize, Deserialize)]
pub struct FullFetchedRecipe {
  title: String,
  id: i32,
  description: Option<String>,
  created_at: chrono::NaiveDateTime,
  picture: String,
  author_given_name: String,
  author_family_name: String,
  author_id: i32,
  author_profile: Option<String>,
  instructions: Vec<String>,
  ingredients: Vec<Ingredient>,
}

#[derive(sqlx::FromRow, Deserialize, Serialize)]
pub struct RecipeWithoutIngredients {
  id: i32,
  title: String,
  description: Option<String>,
  created_at: chrono::NaiveDateTime,
  picture: String,
  author_given_name: String,
  author_family_name: String,
  author_id: i32,
  author_profile: Option<String>,
  instructions: Vec<String>,
}

#[derive(Deserialize, Serialize)]
pub struct FetchedRecipe {
  id: i32,
  title: String,
  picture: Option<String>,
  author_first_name: Option<String>,
  author_last_name: Option<String>,
  author_profile: Option<String>,
}
