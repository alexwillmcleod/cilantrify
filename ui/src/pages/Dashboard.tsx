import axios from 'axios';
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

interface Recipe {
  title: string;
  author_first_name: string;
  author_last_name: string;
  author_profile: string;
}

export default function Dashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const { getHeader } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('recipe', {
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
    <div className="flex flex-col items-center px-10">
      <h2 className="font-bold text-display text-4xl text-accent-blue">
        Dashboard
      </h2>
      <div>
        {recipes.map((element, index) => (
          <div key={index}>
            <p>{element.title}</p>
            <p>
              {element.author_first_name} {element.author_last_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
