use anyhow::Result;
use axum::{
  extract::{Json, State},
  http::StatusCode,
  middleware,
  routing::{get, post},
  Extension, Router,
};
use dotenvy::dotenv;
use entity::entities::user;
use http::{
  header::{self, AUTHORIZATION, CONTENT_TYPE},
  HeaderValue, Method, Request, Response,
};
use sea_axum_app::{
  middleware::auth::maybe_auth,
  routes::auth::{jwt::UserClaims, User},
  AppState,
};
use sea_orm::{ActiveModelTrait, Set};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<()> {
  dotenv().ok();
  tracing_subscriber::fmt()
    .with_max_level(tracing::Level::DEBUG)
    .with_test_writer()
    .init();

  let cors = CorsLayer::new()
    .allow_methods([Method::GET, Method::POST])
    .allow_credentials(true)
    .allow_headers([AUTHORIZATION, CONTENT_TYPE])
    .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap());

  let auth_routes = sea_axum_app::routes::auth::auth_routes();
  let recipe_routes = sea_axum_app::routes::recipes::recipe_routes();

  let app = Router::new()
    .route("/", get(root))
    .route("/cat", get(get_cat_fact))
    .nest("/auth", auth_routes)
    .nest("/recipe", recipe_routes)
    .layer(
      ServiceBuilder::new()
        .layer(Extension::<Option<UserClaims>>(None))
        .layer(middleware::from_fn(maybe_auth)),
    )
    .layer(cors)
    .with_state(Arc::new(AppState::new().await?));

  let addr = SocketAddr::from(([127, 0, 0, 1], 80));
  tracing::debug!("Listening on port {}", 80);
  axum::Server::bind(&addr)
    .serve(app.into_make_service())
    .await?;

  Ok(())
}

async fn root(
  Extension(user_claims): Extension<Option<UserClaims>>,
) -> axum::response::Result<String> {
  match user_claims {
    Some(user_body) => Ok(format!(
      "Hello {} {}",
      user_body.given_name, user_body.family_name
    )),
    None => Ok(String::from("Hello, from Axum!")),
  }
}

#[derive(Serialize, Deserialize, Clone)]
struct CatFact {
  fact: String,
  length: usize,
}

async fn get_cat_fact() -> impl axum::response::IntoResponse {
  let cat_fact: CatFact = CatFact {
    fact: String::from("Cats can be right-pawed or left-pawed."),
    length: 0,
  };
  serde_json::to_string(&cat_fact).unwrap()
}
