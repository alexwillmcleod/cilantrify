pub mod middleware;
pub mod routes;

use anyhow::Result;
use dotenvy::dotenv;
use migration::{Migrator, MigratorTrait};
use oauth2::{basic::BasicClient, AuthUrl, ClientId, ClientSecret, RedirectUrl, TokenUrl};
use sea_orm::{Database, DatabaseConnection};

#[derive(Clone)]
pub struct AppState {
  pub db: DatabaseConnection,
  pub google_oauth_client: BasicClient,
}

impl AppState {
  pub async fn new() -> Result<AppState> {
    dotenv().ok();

    let database_url: String =
      std::env::var("DATABASE_URL").expect("DATABASE_URL variable is not set");

    let db: DatabaseConnection = Database::connect(database_url).await?;
    let google_oauth_client = create_google_oauth_client();

    Migrator::up(&db, None).await?; // Migrate the database
    Ok(AppState {
      db,
      google_oauth_client,
    }) // Return the app state
  }
}

fn create_google_oauth_client() -> BasicClient {
  dotenv().ok();

  let google_client_id: String =
    std::env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID environment variable must be set");
  let google_client_secret: String = std::env::var("GOOGLE_CLIENT_SECRET")
    .expect("GOOGLE_CLIENT_ID environment variable must be set");

  let redirect_url: String = std::env::var("GOOGLE_REDIRECT_URL")
    .expect("GOOGLE_REDIRECT_URL environment variable must be set");

  let auth_url: String = std::env::var("AUTH_URL").unwrap_or_else(|_| {
    tracing::debug!("using default google AUTH_URL as none was set in environment");
    String::from("https://accounts.google.com/o/oauth2/v2/auth")
  });

  let token_url: String = std::env::var("TOKEN_URL").unwrap_or_else(|_| {
    tracing::debug!("using default google TOKEN_URL as none was set in environment");
    String::from("https://www.googleapis.com/oauth2/v4/token")
  });

  BasicClient::new(
    ClientId::new(google_client_id),
    Some(ClientSecret::new(google_client_secret)),
    AuthUrl::new(auth_url).unwrap(),
    Some(TokenUrl::new(token_url).unwrap()),
  )
  .set_redirect_uri(RedirectUrl::new(redirect_url).unwrap())
}
