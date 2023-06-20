use crate::routes::auth::jwt::UserClaims;
use crate::AppState;
use axum::{
  body::Full,
  extract::{Json, Query, State},
  response::{IntoResponse, Response},
  routing::{get, post},
  Extension, Router,
};
use axum_macros::debug_handler;
use http::StatusCode;
use reqwest::ResponseBuilderExt;
use serde::{Deserialize, Serialize};
use std::{
  collections::{HashMap, HashSet},
  sync::Arc,
};
use tracing_subscriber::field::debug;

pub fn recipe_routes() -> Router<Arc<AppState>> {
  Router::new()
    .route("/", post(create))
    .route("/", get(fetch))
  // .route("/page", get(fetch_last))
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
  image: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct RecipeFetchQuery {
  recipe_id: i32,
}

#[derive(Serialize, Deserialize)]
struct FullFetchedRecipe {
  title: String,
  picture: Option<String>,
  author_first_name: Option<String>,
  author_last_name: Option<String>,
  author_profile: Option<String>,
  instructions: Vec<String>,
  ingredients: Vec<Ingredient>,
}

#[debug_handler]
async fn fetch(
  query: Query<RecipeFetchQuery>,
  State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
  let recipe_id = query.recipe_id;
  // let recipe = recipe::Entity::find_by_id(recipe_id)
  //   .find_also_related(user::Entity)
  //   .one(&state.db)
  //   .await;

  // let Ok(recipe) = recipe else {
  //   tracing::debug!("Failed to fetch recipe");
  //   return (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(None));
  // };
  // let Some(recipe) = recipe else {
  //   return (StatusCode::NOT_FOUND, axum::Json(None));
  // };

  // let ingredients = recipe
  //   .0
  //   .find_related(ingredient::Entity)
  //   .all(&state.db)
  //   .await;

  // let Ok(ingredients) = ingredients else {
  //   tracing::debug!("Failed to fetch ingredients");
  //   return (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(None))
  // };

  // let res = FullFetchedRecipe {
  //   title: recipe.0.title,
  //   picture: recipe.0.picture,
  //   author_first_name: match &recipe.1 {
  //     Some(user) => Some(user.given_name.clone()),
  //     None => None,
  //   },
  //   author_last_name: match &recipe.1 {
  //     Some(user) => Some(user.family_name.clone()),
  //     None => None,
  //   },
  //   author_profile: match &recipe.1 {
  //     Some(user) => user.picture.clone(),
  //     None => None,
  //   },
  //   instructions: recipe.0.instructions,
  //   ingredients: ingredients
  //     .iter()
  //     .map(|element| Ingredient {
  //       name: element.name.clone(),
  //       amount: element.amount.clone(),
  //       measurement: element.measurement.to_string(),
  //     })
  //     .collect::<Vec<Ingredient>>(),
  // };

  // (StatusCode::OK, axum::Json(Some(res)))
  todo!()
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
    if ![
      "Grams",
      "Milligrams",
      "Kilograms",
      "Millilitres",
      "Litres",
      "Units",
    ]
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

  let mut url: Option<String> = None;
  if let Some(img) = body.image {
    let image_bb_apikey =
      std::env::var("IMAGE_BB_API_KEY").expect("Missing `IMAGE_BB_API_KEY` env var");

    // Now we've got to upload the image to imagebb
    let client = reqwest::Client::new();

    // Create request parameters
    let mut params = HashMap::new();
    params.insert("image", img);
    let body = client
      .post(format!(
        "https://api.imgbb.com/1/upload?key={}",
        image_bb_apikey
      ))
      .form(&params)
      .send()
      .await;

    let Ok(res) = body else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image"))
  };

    let Ok(data): Result<serde_json::Value, reqwest::Error> = res.json().await else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image"))
  };

    let Some(url_value): Option<&str> = data["data"]["image"]["url"].as_str() else {
    return (StatusCode::INTERNAL_SERVER_ERROR, String::from("could not upload image"))
  };

    url = Some(String::from(url_value));
  }

  // let new_recipe = recipe::ActiveModel {
  //   title: Set(body.title),
  //   instructions: Set(body.instructions),
  //   author_id: Set(user.id),
  //   picture: Set(url),
  //   ..Default::default()
  // };

  // let Ok(recipe) = new_recipe.insert(&state.db).await else {
  //   return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create recipe"));
  // };

  // Let's add our ingredients
  // for ingredient in body.ingredients {
  //   let new_ingredient = ingredient::ActiveModel {
  //     name: Set(ingredient.name),
  //     amount: Set(ingredient.amount),
  //     measurement: Set(match ingredient.measurement {
  //       value if value == String::from("Grams") => Measurement::Grams,
  //       value if value == String::from("Milligrams") => Measurement::Milligrams,
  //       value if value == String::from("Kilogram") => Measurement::Kilograms,
  //       value if value == String::from("Litres") => Measurement::Litres,
  //       value if value == String::from("Millilitres") => Measurement::Millilitres,
  //       value if value == String::from("Units") => Measurement::Units,
  //       _ => return (StatusCode::INTERNAL_SERVER_ERROR, "".to_string()),
  //     }),
  //     recipe_id: Set(recipe.id),
  //     ..Default::default()
  //   };
  //   let Ok(_ingredient) = new_ingredient.insert(&state.db).await else {
  //     return (StatusCode::INTERNAL_SERVER_ERROR, String::from("failed to create ingredient"));
  //   };
  // }

  // (
  //   StatusCode::OK,
  //   format!("successfully created recipe {}", recipe.title),
  // )
  todo!()
}

#[derive(Deserialize, Serialize)]
struct FetchedRecipe {
  id: i32,
  title: String,
  picture: Option<String>,
  author_first_name: Option<String>,
  author_last_name: Option<String>,
  author_profile: Option<String>,
}

// #[debug_handler]
// async fn fetch_last(State(state): State<Arc<AppState>>) -> impl IntoResponse {
//   let cursor = recipe::Entity::find()
//     .find_also_related(user::Entity)
//     .paginate(&state.db, 20);
//   match cursor.fetch().await {
//     Ok(values) => (
//       StatusCode::OK,
//       axum::Json(
//         values
//           .iter()
//           .map(|(recipe, user)| FetchedRecipe {
//             id: recipe.id.clone(),
//             title: recipe.title.clone(),
//             picture: recipe.picture.clone(),
//             author_first_name: match user {
//               Some(author) => Some(author.given_name.clone()),
//               None => None,
//             },
//             author_last_name: match user {
//               Some(author) => Some(author.family_name.clone()),
//               None => None,
//             },
//             author_profile: match user {
//               Some(author) => author.picture.clone(),
//               None => None,
//             },
//           })
//           .collect::<Vec<FetchedRecipe>>(),
//       ),
//     ),
//     Err(..) => (StatusCode::INTERNAL_SERVER_ERROR, axum::Json(vec![])),
//   }
// }
