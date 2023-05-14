use anyhow::Result;
use axum::{
  extract::{Json, State},
  http::StatusCode,
  routing::{get, post},
  Router,
};
use axum_sessions::{
  async_session::MemoryStore,
  extractors::{ReadableSession, WritableSession},
  SessionLayer,
};
use dotenvy::dotenv;
use entity::entities::user;
use http::{header, Method, Request, Response};
use sea_axum_app::{routes::auth::User, AppState};
use sea_orm::{ActiveModelTrait, Set};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
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
    .allow_origin(Any);

  let store = MemoryStore::new();
  let secret =
    std::env::var("SESSION_SECRET").expect("SESSION_SECRET environment variable not set");
  let session_layer = SessionLayer::new(store, &secret.as_bytes()).with_secure(false);

  let auth_routes = sea_axum_app::routes::auth::auth_routes();

  let app = Router::new()
    .route("/", get(root))
    .route("/cat", get(get_cat_fact))
    .nest("/auth", auth_routes)
    .with_state(Arc::new(AppState::new().await?))
    .layer(session_layer)
    .layer(cors);

  let addr = SocketAddr::from(([127, 0, 0, 1], 80));
  tracing::debug!("Listening on port {}", 80);
  axum::Server::bind(&addr)
    .serve(app.into_make_service())
    .await?;

  Ok(())
}

async fn root(mut session: ReadableSession) -> axum::response::Result<String> {
  let user: Option<User> = session.get("user");
  match user {
    Some(user_body) => Ok(format!("Hello {}", user_body.name)),
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
