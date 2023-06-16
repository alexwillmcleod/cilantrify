import NotFoundImage from '../assets/notfound.svg';
import { useParams } from 'react-router';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function ViewRecipe() {
  const { recipe_id } = useParams();
  const [recipe, setRecipe] = useState<any>({ msg: 'Loading..' });
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('recipe', {
        params: {
          recipe_id,
        },
      });
      setRecipe(await res.data);
    };
    fetchData();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-16 pb-24 pt-8 px-24">
        <span className="flex flex-col gap-10 justify-center items-center">
          {recipe.picture ? (
            <img
              className="aspect-video object-cover rounded-xl max-w-4xl"
              src={recipe.picture}
            />
          ) : (
            <img
              className="aspect-video object-none rounded-xl max-w-5xl"
              src={NotFoundImage}
            />
          )}
          <h2 className="font-bold text-center text-3xl text-accent-blue">
            {recipe.title}
          </h2>
        </span>{' '}
        <div className="flex flex-row gap-10 px-10">
          <div className="flex flex-col gap-4 max-w-2xl min-w-fit">
            <h4 className="font-bold text-accent-blue text-2xl">Ingredients</h4>
            <ul className="flex flex-col w-fit list-disc list-inside text-lg gap-1">
              {recipe.ingredients ? (
                recipe.ingredients.map((element, index) => (
                  <li>{element.name}</li>
                ))
              ) : (
                <></>
              )}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-accent-blue text-2xl">
              Instructions
            </h4>
            <ol className="flex flex-col gap-8 text-lg list-decimal list-inside">
              {recipe.instructions ? (
                recipe.instructions.map((element, index) => <li>{element}</li>)
              ) : (
                <></>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
