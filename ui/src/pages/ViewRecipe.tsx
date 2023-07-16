import { A, useParams } from '@solidjs/router';
import { createSignal, onMount, JSXElement } from 'solid-js';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { writeClipboard } from '@solid-primitives/clipboard';
import { useNavigate } from '@solidjs/router';
import defaultAvatar from '/default-avatar.svg';

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
  created_at: Date;
  author_family_name: string;
  author_given_name: string;
  author_profile: string;
  author_id: number;
}

export default function ViewRecipe() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const { user } = useAuth()!;

  const [recipe, setRecipe] = createSignal<Recipe | undefined>(undefined);

  const [snackBarElements, setSnackBarElements] = createSignal<JSXElement[]>(
    []
  );
  const addSnackBar = (element: JSXElement, ms: number) => {
    setSnackBarElements([...snackBarElements(), element]);
    setTimeout(() => {
      setSnackBarElements(snackBarElements().filter((obj) => element != obj));
    }, ms);
  };

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
      navigate('/recipe/not-found');
    }
  });

  const handleDeleteRecipe = async () => {
    try {
      await axios.delete(`/recipe`, {
        params: {
          recipe_id: id,
        },
      });
      addSnackBar(
        <div class="alert alert-success transition-all">
          <span>Successfully deleted recipe</span>
        </div>,
        2000
      );
      setTimeout(() => {
        (
          window as Window & typeof globalThis & { deleted_modal: any }
        ).deleted_modal.showModal();
      }, 3000);
    } catch (err) {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>Failed to delete recipe</span>
        </div>,
        2000
      );
    }
  };

  return (
    <>
      <Navbar />
      {recipe() ? (
        <div class="flex flex-col gap-16 mb-16">
          <div class="flex flex-col gap-6">
            <img
              class="object-cover aspect-video w-screen h-96"
              src={recipe()!.picture}
            />
            <h1 class="font-bold text-center text-7xl">{recipe()!.title}</h1>
            <span class="flex flex-row gap-3 justify-center">
              <img
                class="object-cover aspect-1/1 w-8 h-8 rounded-full"
                src={recipe()!.author_profile || defaultAvatar}
              />
              <h2 class="font-bold text-center text-2xl">
                {recipe()!.author_given_name} {recipe()!.author_family_name}
              </h2>
            </span>
            {/* <p>Published on {recipe()!.created_at.getDate()}</p> */}
            <span class="flex flex-row justify-center gap-1">
              <button
                class="btn btn-ghost"
                onClick={() => {
                  writeClipboard(
                    `https://cilantrify.com/recipe/${recipe()!.id}`
                  );
                  addSnackBar(
                    <div class="alert alert-info transition-all">
                      <span>Copied link to clipboard</span>
                    </div>,
                    15000
                  );
                }}
              >
                <svg
                  class="fill-none w-6 h-6"
                  viewBox="0 0 65 68"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M63.165 1.97873C61.5393 0.233241 59.1333 -0.417043 56.8899 0.267445L4.57599 16.1824C2.20902 16.8703 0.531343 18.8451 0.079399 21.3539C-0.382295 23.9071 1.23038 27.1483 3.33723 28.5036L19.6946 39.0211C21.3723 40.0993 23.5377 39.829 24.926 38.3639L43.6569 18.6466C44.5997 17.6199 46.1603 17.6199 47.1035 18.6466C48.0463 19.6392 48.0463 21.2478 47.1035 22.2746L28.34 41.9954C26.9483 43.4568 26.6883 45.7327 27.7124 47.4987L37.7071 64.7829C38.8774 66.8362 40.8934 68 43.104 68C43.3644 68 43.6569 68 43.9172 67.9657C46.4532 67.6236 48.4688 65.8097 49.2166 63.2427L64.7256 8.58429C65.4084 6.25695 64.7906 3.72426 63.165 1.97873Z"
                    class="fill-secondary"
                  />
                </svg>
              </button>
              {recipe()?.author_id == user()?.id && (
                <div class="dropdown">
                  <button class="btn btn-ghost">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="fill-none w-8 h-8"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M2.00012 11.9999C2.00012 6.47991 6.47012 1.99991 12.0001 1.99991C17.5201 1.99991 22.0001 6.47991 22.0001 11.9999C22.0001 17.5199 17.5201 21.9999 12.0001 21.9999C6.47012 21.9999 2.00012 17.5199 2.00012 11.9999ZM7.52012 13.1999C6.86012 13.1999 6.32012 12.6599 6.32012 11.9999C6.32012 11.3399 6.86012 10.8009 7.52012 10.8009C8.18012 10.8009 8.71012 11.3399 8.71012 11.9999C8.71012 12.6599 8.18012 13.1999 7.52012 13.1999ZM10.8001 11.9999C10.8001 12.6599 11.3401 13.1999 12.0001 13.1999C12.6601 13.1999 13.1901 12.6599 13.1901 11.9999C13.1901 11.3399 12.6601 10.8009 12.0001 10.8009C11.3401 10.8009 10.8001 11.3399 10.8001 11.9999ZM15.2801 11.9999C15.2801 12.6599 15.8101 13.1999 16.4801 13.1999C17.1401 13.1999 17.6701 12.6599 17.6701 11.9999C17.6701 11.3399 17.1401 10.8009 16.4801 10.8009C15.8101 10.8009 15.2801 11.3399 15.2801 11.9999Z"
                        class="fill-secondary"
                      />
                    </svg>
                  </button>
                  <ul
                    tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={handleDeleteRecipe}>Delete</button>
                    </li>
                  </ul>
                </div>
              )}
            </span>
          </div>
          <p class="w-fit px-12 md:px-32 text-xl ">{recipe()!.description}</p>
          <div class="flex flex-col gap-3 w-fit px-12 md:px-32">
            <p class="font-semibold text-2xl">Ingredients</p>
            <ul class="flex flex-col gap-2">
              {recipe()!.ingredients.map((element: any) => (
                <li class="list-disc">
                  <div class="flex flex-row gap-4 text-xl">
                    {element.name}
                    <div class="italic">
                      {element.amount}
                      {element.measurement == 'Units'
                        ? ''
                        : element.measurement}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div class="flex flex-col gap-4 justify-center w-fit px-12 md:px-32">
            <p class="font-semibold text-2xl">Instructions</p>
            <ul class="list-decimal flex flex-col gap-8">
              {recipe()!.instructions.map((element: any) => (
                <li class="list-decimal">
                  <div class="flex flex-row gap-4 text-xl leading-8">
                    {element}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            class={`${
              snackBarElements().length == 0 ? 'hidden' : ''
            }toast toast-start z-50`}
          >
            {snackBarElements()}
          </div>
          <dialog
            id="deleted_modal"
            class="modal modal-bottom sm:modal-middle"
          >
            <form
              method="dialog"
              class="modal-box"
            >
              <h3 class="text-lg">This recipe no longer exists</h3>
              <div class="modal-action">
                <A
                  href="/for-you"
                  class="btn btn-primary"
                >
                  Return
                </A>
              </div>
            </form>
          </dialog>
        </div>
      ) : (
        <div class="w-screen h-screen flex flex-col justify-center items-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      )}
    </>
  );
}
