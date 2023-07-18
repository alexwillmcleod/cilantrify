use std::sync::Arc;

use axum::{
  extract::{Query, State},
  http::StatusCode,
  response::{IntoResponse, Response},
  Extension,
};
use axum_macros::debug_handler;
use serde::{Deserialize, Serialize};

use crate::{routes::auth::jwt::UserClaims, AppState};

#[derive(Serialize, Deserialize, Debug)]
struct DeletedRecipe {
  id: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RecipeDeleteQuery {
  recipe_id: i32,
}

#[debug_handler]
pub async fn delete_recipe(
  Query(recipe_query): Query<RecipeDeleteQuery>,
  Extension(user): Extension<Option<UserClaims>>,
  State(state): State<Arc<AppState>>,
) -> Response {
  let Some(user) = user else {
    return (StatusCode::UNAUTHORIZED, String::from("you must be signed in to delete a recipe")).into_response();
  };

  // let Ok(recipe) = sqlx::query!(
  //   r#"
  //     SELECT
  //       id
  //     FROM
  //       recipes
  //     WHERE
  //       id = $1
  //   "#,
  //   recipe_query.recipe_id
  // ).fetch_one(&state.db).await else {
  //   return (StatusCode::NOT_FOUND, format!("could not find recipe with id {} created by user with id {}", recipe_query.recipe_id, user.id)).into_response();
  // };

  // tracing::debug!("{:#?}", recipe);

  match sqlx::query_as!(
    DeletedRecipe,
    r#"
      DELETE 
      FROM 
        recipes 
      WHERE 
          author_id = $1 
        AND 
          id = $2
      RETURNING id 
    "#,
    user.id,
    recipe_query.recipe_id
  )
  .fetch_one(&state.db)
  .await
  {
    Ok(recipe) => (
      StatusCode::OK,
      format!("successfully deleted recipe with id {}", recipe.id),
    )
      .into_response(),
    Err(err) => {
      tracing::debug!("{:#?}", err);
      (
        StatusCode::NOT_FOUND,
        format!(
          "could not delete recipe with id {} created by user with id {}",
          recipe_query.recipe_id, user.id
        ),
      )
        .into_response()
    }
  }
}
