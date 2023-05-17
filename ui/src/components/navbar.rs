use leptos::*;
use reqwest;
use serde::{Deserialize, Serialize};
use stylers::style_str;

#[component]
pub fn Navbar(cx: Scope) -> impl IntoView {
  #[derive(Serialize, Deserialize, Debug, Clone)]
  pub struct User {
    pub picture: Option<String>,
    pub email: String,
    pub name: String,
    pub given_name: String,
    pub family_name: String,
  }

  let user_info: Resource<(), User> = create_resource(
    cx,
    || (),
    |_| async move {
      let client = reqwest::Client::new();
      client
        .get("localhost/auth/info")
        .send()
        .await
        .unwrap()
        .json::<User>()
        .await
        .unwrap()
    },
  );

  let (class_name, style_vars) = style_str! {
    nav {
      display: flex;
      flex-direction: row;
      padding: 1rem;
      justify-content: space-between;
    }
    h1, button {
      font-family: "Dela Gothic One";
    }
    button {
      border: none;
      padding: 1rem;
      border-radius: 1vmin;
      font-weight: bold;
      cursor: pointer;
    }
  };

  view! {
    cx,
    class=class_name,
    <style>{style_vars}</style>
    <nav>
      <span>
        <h1>"Cilantrify 🌿"</h1>
      </span>
      <span>
        <button>
          {
            user_info.read(cx).unwrap_or(User {email: "".to_string(), name: "".to_string(), given_name: "".to_string(), family_name: "".to_string(), picture: None}).picture
          }
        </button>
      </span>
    </nav>
  }
}
