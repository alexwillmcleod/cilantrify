use crate::routes::auth::jwt::{verify, UserClaims};
use crate::AppState;
use axum::response::{self, Response};
use axum::{
  extract::State,
  http::{Request, StatusCode},
  middleware::Next,
  response::IntoResponse,
};
use axum_auth::AuthBearer;

pub async fn auth<B>(
  bearer_token: Option<AuthBearer>,
  mut request: Request<B>,
  next: Next<B>,
) -> Response {
  let Some(AuthBearer(token)) = bearer_token else {
    return (StatusCode::UNAUTHORIZED).into_response();
  };
  let Ok(claims ) = verify(token) else {
    return (StatusCode::UNAUTHORIZED).into_response();
  };
  request.extensions_mut().insert(claims);
  next.run(request).await
}
pub async fn maybe_auth<B>(
  bearer_token: Option<AuthBearer>,
  mut request: Request<B>,
  next: Next<B>,
) -> Response {
  let Some(AuthBearer(token)) = bearer_token else {
    return next.run(request).await;
  };
  let Ok(claims) = verify(token) else {
    return next.run(request).await;
  };
  request.extensions_mut().insert(Some(claims));
  next.run(request).await
}
