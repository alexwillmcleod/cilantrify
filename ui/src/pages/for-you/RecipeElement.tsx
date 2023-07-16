import { createEffect } from 'solid-js';
import { A } from '@solidjs/router';

interface RecipeElementProps {
  title: string;
  description: string;
  author: string;
  image: string;
  id: number;
  authorProfile: string;
}

export default function RecipeElement(props: RecipeElementProps) {
  createEffect(() => {
    console.log(props.image);
  });
  return (
    <div class="card w-screen-xl max-w-screen-sm bg-base-100 shadow-xl">
      <img
        src={props.image}
        class="object-cover aspect-video w-128 h-64"
        alt={props.title}
      />
      <div class="card-body">
        <h2 class="card-title">
          {props.title}
          {/* <div class="badge badge-secondary">NEW</div> */}
        </h2>
        <span class="flex flex-row items-center gap-3">
          <img
            src={props.authorProfile}
            class="object-cover aspect-1/1 w-8 h-8 rounded-full"
          />
          <h3 class="font-medium text-lg">{props.author}</h3>
        </span>
        <p class="truncate">{props.description}</p>
        <div class="card-actions justify-end">
          <A
            href={`/recipe/${props.id}`}
            class="btn btn-primary"
          >
            Let's cook!
          </A>
          {/* <div class="badge badge-outline">Fashion</div> */}
          {/* <div class="badge badge-outline">Products</div> */}
        </div>
      </div>
    </div>
  );
}
