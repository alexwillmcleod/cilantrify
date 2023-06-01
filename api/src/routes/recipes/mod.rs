use crate::routes::auth::jwt::UserClaims;
use crate::AppState;
use axum::{
  extract::{Json, State},
  response::IntoResponse,
  routing::{get, post},
  Extension, Router,
};
use axum_macros::debug_handler;
use entity::entities::{ingredient, recipe, sea_orm_active_enums::Measurement};
use http::StatusCode;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, Set};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, sync::Arc};

pub fn recipe_routes() -> Router<Arc<AppState>> {
  Router::new().route("/", post(create))
}

#[derive(Serialize, Deserialize, Debug)]
struct Ingredient {
  name: String,
  amount: i32,
  measurement: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateRecipeBody {
  title: String,
  ingredients: Vec<Ingredient>,
  instructions: Vec<String>,
}

async fn create(
  Extension(user_claims): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
  Json(body): Json<CreateRecipeBody>,
) -> impl IntoResponse {
  // We are going to create the recipe and add it to the database

  // Lets check there is a user
  let Some(user) = user_claims else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to create a recipe"));
  };

  // Let's check every measurement string is valid
  for ingredient in &body.ingredients {
    if !["Grams", "Milligrams", "Kilograms", "Millilitres", "Litres"]
      .iter()
      .map(|&x| x.to_string())
      .collect::<HashSet<String>>()
      .contains(&ingredient.measurement)
    {
      return (
        StatusCode::BAD_REQUEST,
        format!("{} is not a valid measurement unit", ingredient.measurement),
      );
    }
  }

  // Every measurement unit is valid
  let new_recipe = recipe::ActiveModel {
    title: Set(body.title),
    instructions: Set(body.instructions),
    author_id: Set(user.id),
    ..Default::default()
  };

  let Ok(recipe) = new_recipe.insert(&state.db).await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe"));
  };

  // Let's add our ingredients
  for ingredient in body.ingredients {
    let new_ingredient = ingredient::ActiveModel {
      name: Set(ingredient.name),
      amount: Set(ingredient.amount),
      measurement: Set(match ingredient.measurement {
        value if value == String::from("Grams") => Measurement::Grams,
        value if value == String::from("Milligrams") => Measurement::Milligrams,
        value if value == String::from("Kilogram") => Measurement::Kilograms,
        value if value == String::from("Litres") => Measurement::Litres,
        value if value == String::from("Millilitres") => Measurement::Millilitres,
        _ => return (StatusCode::INTERNAL_SERVER_ERROR, "".to_string()),
      }),
      recipe_id: Set(recipe.id),
      ..Default::default()
    };
    let Ok(_ingredient) = new_ingredient.insert(&state.db).await else {
      return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create ingredient"));
    };
  }

  (
    StatusCode::OK,
    format!("successfully created recipe {}", recipe.title),
  )
}
