use std::sync::Arc;

use axum::{extract::{State, Query}, http::StatusCode, response::{IntoResponse, Response}, Json};
use axum_macros::debug_handler;
use serde::{Serialize, Deserialize};

use crate::AppState;

use super::{FullFetchedRecipe, Unit, Ingredient, RecipeWithoutIngredients};


#[derive(Debug, Deserialize)]
pub struct SearchPaginationParams {
  page: i64,
  search: Option<String>,
  limit: i64 
}

#[derive(Debug, Deserialize)]
struct CountResult {
  count: Option<i64>
}

#[derive(Serialize)]
struct PaginatedResponse {
  page_count: i32,
  recipes: Vec<FullFetchedRecipe>
}

#[debug_handler]
pub async fn search_paginated(State(state): State<Arc<AppState>>, Query(search_pagination_params): Query<SearchPaginationParams>) -> Response {

  let offset = (search_pagination_params.page - 1) * search_pagination_params.limit;
  let limit = search_pagination_params.limit;
  let search = search_pagination_params.search.unwrap_or(String::from(""));
  let search = format!("%{}%", search);

  let mut res: Vec<FullFetchedRecipe> = Vec::new();

  // Let's get the total count of pages
  let Ok(record) = sqlx::query_as!(
    CountResult,
    r#"
      SELECT COUNT(*)
      FROM 
        recipes
      WHERE 
        title ILIKE $1
      OR
        description ILIKE $1
    "#,
    search
  ).fetch_one(&state.db).await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not count pages")).into_response();
  };

  let Some(count) = record.count else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not count pages")).into_response();
  };

  let page_count = f64::ceil(count as f64 / limit as f64) as i32;



  let Ok(recipes) = sqlx::query_as!(
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
        title ILIKE $1
      OR
        description ILIKE $1
    ORDER BY 
      created_at
    DESC
    LIMIT $2
    OFFSET $3
  "#,
    search,
    limit, 
    offset
  )
    .fetch_all(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };


    for recipe in recipes {
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

      let full_fetched_recipe = FullFetchedRecipe {
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

      res.push(full_fetched_recipe);
    }

    let final_response = PaginatedResponse {
      page_count,
      recipes: res
    };

    (StatusCode::OK, Json(final_response)).into_response()

}



