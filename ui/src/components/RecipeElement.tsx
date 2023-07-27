import { createEffect } from 'solid-js';
import { A } from '@solidjs/router';
import { useSearch } from '../hooks/SearchContext';

interface RecipeElementProps {
  title: string;
  author: string;
  image: string;
  id: number;
  authorProfile: string;
  authorId: number;
}

export default function RecipeElement(props: RecipeElementProps) {
  createEffect(() => {
    console.log(props.image);
  });
  const { setSearchTerm } = useSearch()!;
  return (
    <A
      href={`/recipe/${props.id}`}
      onClick={() => setSearchTerm('')}
      class="card card-compact max-w-md bg-base-100 shadow-xl"
    >
      <img
        src={props.image}
        class="object-cover aspect-video w-128 h-64 rounded-xl"
        alt={props.title}
      />
      <div class="card-body">
        <h2 class="card-title">
          {props.title}
          {/* <div class="badge badge-secondary">NEW</div> */}
        </h2>
        <A
          href={`/profile/${props.authorId}`}
          class="flex flex-row items-center gap-3"
        >
          <img
            src={props.authorProfile}
            class="object-cover aspect-1/1 w-8 h-8 rounded-full"
          />
          <h3 class="font-medium text-lg">{props.author}</h3>
        </A>
      </div>
    </A>
  );
}
