import axios from 'axios';
import PlusIcon from '../../assets/plus-icon.svg';
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Recipe from './Recipe';
import { useNavigate } from 'react-router';

interface Recipe {
  id: number;
  title: string;
  picture?: string;
  author_first_name: string;
  author_last_name: string;
  author_profile?: string;
}

export default function Dashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const { getHeader } = useAuth();
  const navigate = useNavigate();

  const handleCreateRecipe = () => {
    navigate('/recipe/create/ingredients');
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('recipe/page', {
        headers: {
          Authorization: getHeader(),
        },
      });
      console.log(res.data);
      const data: Recipe[] = await res.data;
      setRecipes(data);
    };
    fetchData();
  }, []);

  // We need to fetch the last 100 newest recipes

  return (
    <div className="flex flex-col items-center px-10 gap-10 pb-32">
      <h2 className="font-bold text-display text-4xl text-accent-blue">
        Dashboard
      </h2>
      <div className="flex flex-col gap-4">
        {recipes.map((element, index) => (
          <Recipe
            id={element.id}
            title={element.title}
            picture={element.picture}
            key={index}
            firstName={element.author_first_name}
            lastName={element.author_last_name}
          />
        ))}
      </div>
      <button
        className="fixed bottom-5 right-5"
        onClick={handleCreateRecipe}
      >
        <img
          className="w-16"
          src={PlusIcon}
        />
      </button>
    </div>
  );
}
