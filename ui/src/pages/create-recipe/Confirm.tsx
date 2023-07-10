import RecipePreview from '../../components/RecipePreview';
import { Accessor, createEffect, createSignal } from 'solid-js';
import { IngredientElementProps } from './IngredientElement';

export default function Confirm(props: {
  name: Accessor<string>;
  image: Accessor<string | undefined>;
  ingredients: Accessor<IngredientElementProps[]>;
  instructions: Accessor<string[]>;
}) {
  createEffect(() => {
    console.log(props.image()!);
  });

  return (
    <div class="p-100">
      {props.image() && (
        <RecipePreview
          image={props.image()!}
          name={props.name()}
          ingredients={props.ingredients()}
          instructions={props.instructions()}
        />
      )}
    </div>
  );
}
