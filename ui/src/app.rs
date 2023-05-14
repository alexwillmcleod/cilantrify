use leptos::{ev::MouseEvent, *};
use serde::{Deserialize, Serialize};
use stylers::style_str;

#[derive(Serialize, Deserialize, Clone)]
struct CatFact {
  fact: String,
  length: usize,
}

#[component]
pub fn App(cx: Scope) -> impl IntoView {
  let (counter, set_counter) = create_signal(cx, 0);
  let handle_counter_button_click = move |_: MouseEvent| set_counter.update(|count| *count += 1);

  let async_data = create_resource(
    cx,
    || (),
    |_| async move {
      tracing::debug!("Requesting value");
      // let value = reqwest::get("https://catfact.ninja/fact")
      let value = reqwest::get("http://localhost/cat")
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
      let value: CatFact = serde_json::from_slice(value.as_bytes()).unwrap();
      value.fact
    },
  );

  let (class_name, style_val) = style_str! {
    div {
      width: 100vw;
      height: 100vh;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
    p {
      font-family: "Open Sans";
      font-weight: bold;
      font-size: 2rem;
    }
    button {
      font-size: 1.5rem;
      font-family: "Dela Gothic One";
      font-weight: bold;
      border: none;
      border-radius: 1vmin;
      padding: 1rem;
    }
  };

  view! {
    cx,
    class=class_name,
    <style>{style_val}</style>
    <div>
      <p>"Hello from 🌊 Sea 🐚 Axum!"</p>
      <Suspense
        fallback=move || view! {cx, <p>"Loading..."</p> }
      >
        <p>"Fact about cats: " {move || async_data.read(cx)}</p>

      </Suspense>
      <button on:click=handle_counter_button_click>"You have clicked this " {counter} " times"</button>
    </div>
  }
}
