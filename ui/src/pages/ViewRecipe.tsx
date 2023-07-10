import { useParams } from '@solidjs/router';
import { createSignal, onMount, createEffect } from 'solid-js';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Ingredient {
  name: string;
  amount: number;
  measurement: 'g' | 'kg' | 'mg' | 'Units' | 'mL' | 'L';
}

interface Recipe {
  title: string;
  description: string | undefined;
  picture: string;
  instructions: string[];
  ingredients: Ingredient[];
  id: number;
  createdAt: Date;
  author_family_name: string;
  author_given_name: string;
  author_profile: string;
}

export default function ViewRecipe() {
  const params = useParams();
  const { id } = params;

  const [recipe, setRecipe] = createSignal<Recipe | undefined>(undefined);

  onMount(async () => {
    try {
      const res = await axios.get(`/recipe`, {
        params: {
          recipe_id: id,
        },
      });
      console.log(res.data);
      setRecipe(res.data);
    } catch (err) {
      console.error(err);
    }
  });

  createEffect(() => {
    console.log(`recipe = ${JSON.stringify(recipe())}`);
  });

  return (
    <>
      <Navbar />
      {recipe() ? (
        <div class="flex flex-col items-center gap-16 mb-10">
          <div class="flex flex-col gap-6">
            <img
              class="object-cover aspect-video w-screen h-96"
              src={recipe()!.picture}
            />
            <h1 class="font-bold text-center text-7xl">{recipe()!.title}</h1>
            <span class="flex flex-row gap-3 justify-center">
              <img
                class="object-cover aspect-1/1 w-8 h-8 rounded-full"
                src={recipe()!.author_profile}
              />
              <h2 class="font-bold text-center text-2xl">
                {recipe()!.author_given_name} {recipe()!.author_family_name}
              </h2>
            </span>
          </div>
          <div class="flex flex-col gap-3 justify-center w-fit">
            <p class="font-semibold text-2xl">Ingredients</p>
            <ul class="flex flex-col gap-2 justify-center">
              {recipe()!.ingredients.map((element: any) => (
                <li class="list-disc">
                  <div class="flex flex-row gap-4 text-center">
                    {element.name}
                    <span class="italic">
                      {element.amount}
                      {element.measurement}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div class="flex flex-col gap-3 justify-center w-fit">
            <p class="font-semibold text-2xl">Instructions</p>
            <ul class="list-decimal flex flex-col gap-2">
              {recipe()!.instructions.map((element: any) => (
                <li class="list-decimal">
                  <div class="flex flex-row gap-4">{element}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div class="w-screen h-screen flex flex-col justify-center items-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </>
  );
}
