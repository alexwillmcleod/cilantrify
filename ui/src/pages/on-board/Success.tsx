import PlusIcon from '../../assets/plus-icon.svg';
import WorldArt from '../../assets/world.svg';
import SendIcon from '../../assets/send.svg';
import Info from '../../assets/info.svg';
import IngredientListElement, {
  IngredientListElementProps,
  IngredientListProps,
} from './IngredientListElement';
import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import { CreateRecipeContext } from '../../main';
import { FileContent } from 'use-file-picker';
import NotFoundImage from '../../assets/notfound.svg';

export default function RecipeCreateSuccess() {
  const navigate = useNavigate();
  const createRecipeContext = useContext(CreateRecipeContext);

  const { getHeader } = useAuth();

  const handleContinueClick = () => {
    // We are going to submit the recipe here
    const fetchData = async () => {
      const res = await axios.post(
        'recipe',
        {
          title: createRecipeContext.title,
          ingredients: createRecipeContext.ingredients,
          instructions: createRecipeContext.instructions,
          image: createRecipeContext.image.split(',')[1],
        },
        {
          headers: {
            Authorization: getHeader(),
          },
        }
      );
      console.log(res);
    };
    fetchData();
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
                Confirm your recipe!
              </p>
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
              {createRecipeContext.title}
            </h3>
            {createRecipeContext.image ? (
              <img
                className="aspect-video object-cover rounded-md"
                src={createRecipeContext.image}
              />
            ) : (
              <img
                className="aspect-video object-fit rounded-md"
                src={NotFoundImage}
              />
            )}
            <span>
              <h5 className="text-md font-semibold text-black text-display">
                Ingredients
              </h5>
              <ul className="list-disc list-outside p-3">
                {createRecipeContext.ingredients.map(
                  ({ name, amount, measurement }) => (
                    <li>
                      <span className="flex flex-row gap-4 text-sm">
                        <p>{name}</p>
                        <p className="font-sans text-light-grey">
                          {amount}
                          {measurement}
                        </p>
                      </span>
                    </li>
                  )
                )}
              </ul>
            </span>
            <span>
              <h5 className="text-md font-semibold text-black text-display">
                Instructions
              </h5>
              <ul className="list-decimal list-outside p-3">
                {createRecipeContext.instructions.map((instruction) => (
                  <li>
                    <span className="flex flex-row gap-4 text-sm">
                      <p>{instruction}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </span>
          </div>
          <button
            onClick={handleContinueClick}
            className="bg-accent-blue py-1 px-3 rounded-md w-fit text-sm text-white"
          >
            I love it!
          </button>
        </div>
      </div>
    </div>
  );
}
