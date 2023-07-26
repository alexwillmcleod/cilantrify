use std::sync::Arc;
use axum::{http::StatusCode, extract::{ws::{WebSocket, Message}, Query, State, WebSocketUpgrade}, response::{Response, IntoResponse}, Json};
use axum_macros::debug_handler;
use serde::{Serialize, Deserialize};
use serde_json::Result;



use crate::AppState;

use super::{FullFetchedRecipe, Unit, Ingredient, RecipeWithoutIngredients};


#[derive(Debug, Deserialize)]
pub struct SearchPaginationParams {
  page: i64,
  search: Option<String>,
  limit: i64,
  user: Option<i32>
}

#[derive(Debug, Deserialize)]
struct CountResult {
  count: Option<i64>
}

#[derive(Serialize)]
struct PaginatedResponse {
  page_count: i32,
  recipes: Vec<SearchedRecipe>
}

#[debug_handler]
pub async fn search_paginated(State(state): State<Arc<AppState>>, Query(search_pagination_params): Query<SearchPaginationParams>) -> Response {

  let offset = (search_pagination_params.page - 1) * search_pagination_params.limit;
  let limit = search_pagination_params.limit;
  let user_id: Option<i32> = search_pagination_params.user;
  let search = search_pagination_params.search.unwrap_or(String::from(""));
  let search = format!("%{}%", search);

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
    SearchedRecipe, 
    r#"
    SELECT 
      recipes.id AS "id",
      recipes.title AS "title",
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
        (title ILIKE $1
      OR
        description ILIKE $1)
      AND
        author_id = COALESCE($2, author_id)
      
    ORDER BY 
      created_at
    DESC
    LIMIT $3
    OFFSET $4
  "#,
    search,
    user_id,
    limit, 
    offset
  )
    .fetch_all(&state.db)
    .await else {
      return (StatusCode::NOT_FOUND, String::from("could not find recipe")).into_response();
    };

    let final_response = PaginatedResponse {
      page_count,
      recipes 
    };

    (StatusCode::OK, Json(final_response)).into_response()

}

#[derive(Serialize, Deserialize)]
struct SearchWebsocketRequest {
  query: String,
  user: Option<i64>, // If you are looking at a users profile with their id
  limit: i64 
}

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct SearchedRecipe {
  id: i32,
  title: String,
  created_at: chrono::NaiveDateTime,
  picture: String,
  author_given_name: String,
  author_family_name: String,
  author_id: i32,
  author_profile: Option<String>,
}


#[debug_handler]
pub async fn search_handler(ws: WebSocketUpgrade, State(state): State<Arc<AppState>>) -> Response {
  ws.on_upgrade(|socket| search_handle_socket(socket, state))
}

async fn search_handle_socket(
  mut socket: WebSocket,
  state: Arc<AppState>
) {
  let mut recipes_sent: i64 = 0;
  let mut last_recipe_query = String::from("");
  while let Some(Ok(Message::Text(text))) = socket.recv().await {

    tracing::debug!("{:?}", text);    


    let Ok(req): Result<SearchWebsocketRequest> = serde_json::from_str(text.as_str()) else {
      socket.send(Message::Text(String::from("could not parse the json"))).await;
      continue;
    };

    let search_query = format!("%{}%", req.query);

    if search_query != last_recipe_query {
      recipes_sent = 0;
    }
    last_recipe_query = search_query.clone();

    let Ok(recipes)  = sqlx::query_as!(
      SearchedRecipe, 
      r#"
      SELECT 
        recipes.id AS "id",
        recipes.title AS "title",
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
    
    "#, search_query, req.limit, recipes_sent)
      .fetch_all(&state.db)
      .await else {
        socket.send(Message::Text(String::from("failed to get recipes"))).await;
        break;
      };

    recipes_sent += recipes.len() as i64;

    let Ok(recipes_as_string) = serde_json::to_string(&recipes) else {
      socket.send(Message::Text(String::from("failed to convert recipes struct to string"))).await;
      break;
    };

    socket.send(Message::Text(recipes_as_string)).await;

  };
    
}
