use leptos::*;
use stylers::style_str;

#[component]
pub fn Landing(cx: Scope) -> impl IntoView {
  let (class_name, style_var) = style_str! {
    h1 {
      font-family: "Dela Gothic One";
    }
  };

  view! {
    cx,
    class=class_name,
    <style>{style_var}</style>
    <div>
      <p>"Landing Page"</p>
    </div>
  }
}
