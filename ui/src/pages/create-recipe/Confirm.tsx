import RecipePreview from '../../components/RecipePreview';
import { Accessor } from 'solid-js';
import { IngredientElementProps } from './IngredientElement';

export default function Confirm(props: {
  name: Accessor<string>;
  image: Accessor<File | undefined>;
  ingredients: Accessor<IngredientElementProps[]>;
  instructions: Accessor<string[]>;
}) {
  return (
    <div class="p-100">
      {props.image() && (
        <RecipePreview
          image={URL.createObjectURL(props.image()!)}
          name={props.name()}
          ingredients={props.ingredients()}
          instructions={props.instructions()}
        />
      )}
    </div>
  );
}
