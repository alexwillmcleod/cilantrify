import PlusIcon from '../../assets/plus-icon.svg';
import WorldArt from '../../assets/world.svg';
import SendIcon from '../../assets/send.svg';
import Info from '../../assets/info.svg';
import IngredientListElement, {
  IngredientListElementProps,
  IngredientListProps,
} from './IngredientListElement';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function RecipeCreateIngredients() {
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState<IngredientListProps[]>([]);
  const [recipeTitle, setRecipeTitle] = useState<string | null>('');
  const [instructions, setInstructions] = useState<string[]>([]);

  useEffect(() => {
    // We are going to get any of the values from localStorage
    if (localStorage.getItem('ingredients')) {
      setIngredients(JSON.parse(localStorage.getItem('ingredients')!));
    }
    if (localStorage.getItem('recipe-title')) {
      setRecipeTitle(localStorage.getItem('recipe-title'));
    }
    if (localStorage.getItem('instructions')) {
      setInstructions(JSON.parse(localStorage.getItem('instructions')!));
    }
  }, []);

  const handleContinueClick = () => {
    // We are going to submit the recipe here
    localStorage.removeItem('ingredients');
    localStorage.removeItem('recipe-title');
    localStorage.removeItem('instructions');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-max">
      <div className="flex flex-row gap-20 px-10 py-4 h-full w-full justify-center">
        <div className="flex flex-col h-full justify-between">
          <p className="font-display text-lg text-accent-blue">Awesome!</p>
          <span className="flex flex-col gap-12 h-full justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-md text-accent-blue">
                Your recipe is live
              </p>
              <button className="bg-accent-blue p-1 w-fit rounded-md">
                <img
                  src={SendIcon}
                  width={20}
                />
              </button>
            </div>
            <div className="flex flex-col justify-center items-center max-md:hidden">
              <img
                src={WorldArt}
                width={300}
              />
            </div>
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col bg-accent-blue-clear w-96 p-4 rounded-md gap-4">
            <h3 className="text-xl font-semibold text-accent-blue text-display">
              {recipeTitle}
            </h3>
            <span>
              <h5 className="text-md font-semibold text-black text-display">
                Ingredients
              </h5>
              <ul className="list-disc list-outside p-3">
                {ingredients.map(({ name, amount, measurement }) => (
                  <li>
                    <span className="flex flex-row gap-4 text-sm">
                      <p>{name}</p>
                      <p className="font-sans text-light-grey">
                        {amount}
                        {measurement}
                      </p>
                    </span>
                  </li>
                ))}
              </ul>
            </span>
            <span>
              <h5 className="text-md font-semibold text-black text-display">
                Instructions
              </h5>
              <ul className="list-decimal list-outside p-3">
                {instructions.map((instruction) => (
                  <li>
                    <span className="flex flex-row gap-4 text-sm">
                      <p>{instruction}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </span>
          </div>
          <button className="bg-accent-blue p-1 rounded-md w-fit text-sm text-white">
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
