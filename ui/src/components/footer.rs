use leptos::*;
use stylers::style_str;

#[component]
pub fn Footer(cx: Scope) -> impl IntoView {
  let (class_name, style_vars) = style_str! {
    * {
      font-family: "Atkinson Hyperlegible";
    }
    .container {
      display: flex;
      flex-direction: row;
      padding: 1rem;
    }
  };

  view! {
    cx,
    class=class_name,
    <style>{style_vars}</style>
    <div class="container">
      <p>"Built with 🦀 by "<a href="https://www.alexwillmcleod.com" target="_blank">"Alex McLeod"</a></p>
    </div>
  }
}
