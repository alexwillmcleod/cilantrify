use leptos::{mount_to_body, view};
use sea_axum_app_ui::app::{App, AppProps};

fn main() {
  mount_to_body(|cx| view! { cx, <App />});
}
