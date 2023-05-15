use leptos::*;
use stylers::style_str;

#[component]
pub fn Navbar(cx: Scope) -> impl IntoView {
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
        <button>"Profile"</button>
      </span>
    </nav>
  }
}
