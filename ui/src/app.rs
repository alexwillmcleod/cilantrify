use crate::components::footer::{Footer, FooterProps};
use crate::components::navbar::{Navbar, NavbarProps};
use crate::pages::landing::{Landing, LandingProps};
use leptos::*;
use leptos_router::*;
use stylers::style_str;

#[component]
pub fn App(cx: Scope) -> impl IntoView {
  let (class_name, style_vars) = style_str! {
    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100vw;
    }
    footer {
      margin-top: auto;
    }
  };

  view! {
    cx,
    class=class_name,
    <style>{style_vars}</style>
    <div class="container">
      <Router>
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" view=|cx| view! {cx, <Landing/> }/>
          </Routes>
        </main>
        <footer>
          <Footer />
        </footer>
      </Router>
    </div>
  }
}
