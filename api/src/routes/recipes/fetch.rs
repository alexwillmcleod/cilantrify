use std::sync::Arc;

use axum::{http::StatusCode, extract::{Query, State}, response::{Response, IntoResponse}};
use axum_macros::debug_handler;
use serde::{Serialize, Deserialize};

use crate::AppState;

use super::{FullFetchedRecipe, Unit, Ingredient, RecipeWithoutIngredients};

#[derive(Serialize, Deserialize)]
pub struct RecipeFetchQuery {
  recipe_id: i32,
}

#[debug_handler]
pub async fn fetch(
  query: Query<RecipeFetchQuery>,
  State(state): State<Arc<AppState>>,
) -> Response {
  let recipe_id = query.recipe_id;

  let Ok(recipe) = sqlx::query_as!(
    RecipeWithoutIngredients, 
    r#"
    SELECT 
      recipes.id AS "id",
      recipes.title AS "title",
      recipes.description AS "description",
      recipes.instructions AS "instructions", 
      recipes.created_at AS "created_at",
      recipes.picture AS "picture",
      users.given_name AS "author_given_name",
      users.family_name AS "author_family_name",
      users.picture AS "author_profile",
      users.id AS "author_id"
    FROM 
      recipes
      JOIN users ON recipes.author_id = users.id
    WHERE 
      recipes.id = $1
  "#, recipe_id)
    .fetch_one(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };

    // Let's look for the ingredients now
    let Ok(ingredients) = sqlx::query_as!(
      Ingredient,
      r#"
        SELECT 
          name,
          amount,
          unit AS "measurement: Unit"
        FROM 
          ingredients
        WHERE recipe_id = $1
      "#, 
      recipe.id
    ).fetch_all(&state.db).await else {
      return (StatusCode::NOT_FOUND, String::from("could not find ingredients")).into_response();
    };

  let res = FullFetchedRecipe {
    title: recipe.title,
    id: recipe.id,
    description: recipe.description,
    created_at: recipe.created_at,
    picture: recipe.picture,
    author_given_name: recipe.author_given_name,
    author_family_name: recipe.author_family_name,
    author_profile: recipe.author_profile,
    author_id: recipe.author_id,
    instructions: recipe.instructions,
    ingredients
  };

  (StatusCode::OK, axum::Json(Some(res))).into_response()
}