import Navbar from '../../components/Navbar';
import axios from 'axios';
import { createSignal, JSXElement, onMount } from 'solid-js';
import Ingredients from './Ingredients';
import Instructions from './Instructions';
import Name from './Name';
import Confirm from './Confirm';
import { A, useNavigate, useParams } from '@solidjs/router';
import { IngredientElementProps } from './IngredientElement';
import { useAuth } from '../../hooks/useAuth';
import ImageStep from './Image';

const StepProgressBar = (props: any) => (
  <div class="w-[50vw] steps invisible md:visible steps-horizontal">
    <button
      onClick={() => props.setStep(0)}
      class={`step ${props.step() >= 0 ? 'step-primary' : ''}`}
      tabindex="-1"
    >
      Name
    </button>
    <button
      onClick={() => props.setStep(1)}
      tabindex="-1"
      class={`step ${props.step() >= 1 ? 'step-primary' : ''}`}
    >
      Ingredients
    </button>
    <button
      onClick={() => props.setStep(2)}
      tabindex="-1"
      class={`step ${props.step() >= 2 ? 'step-primary' : ''}`}
    >
      Instructions
    </button>
    <button
      onClick={() => props.setStep(3)}
      tabindex="-1"
      class={`step ${props.step() >= 3 ? 'step-primary' : ''}`}
    >
      Image
    </button>
    <button
      onClick={() => props.setStep(4)}
      class={`step ${props.step() >= 4 ? 'step-primary' : ''}`}
      tabindex="-1"
    >
      Confirm
    </button>
  </div>
);

export default function EditRecipe() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth()!;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [step, setStep]: [Function, Function] = createSignal<number>(0);
  const [authorName, setAuthorName] = createSignal<string>('');

  const [snackBarElements, setSnackBarElements] = createSignal<JSXElement[]>(
    []
  );

  const [name, setName] = createSignal<string>('');
  const [description, setDescription] = createSignal<string>('');
  const [ingredients, setIngredients] = createSignal<IngredientElementProps[]>(
    []
  );
  const [instructions, setInstructions] = createSignal<string[]>([]);
  const [image, setImage] = createSignal<string | undefined>(undefined);
  const [imageName, setImageName] = createSignal<string>('');

  onMount(async () => {
    try {
      const res = await axios.get(`/recipe`, {
        params: {
          recipe_id: id,
        },
      });
      if (!user()) {
        (
          window as Window & typeof globalThis & { unauthenticated_modal: any }
        ).unauthenticated_modal.showModal();
      }
      if (res.data.author_id != user()!.id) {
        (
          window as Window & typeof globalThis & { unauthenticated_modal: any }
        ).unauthenticated_modal.showModal();
      }
      console.log(res.data);
      setAuthorName(
        `${res.data.author_given_name} ${res.data.author_family_name}`
      );
      setName(res.data.title);
      setDescription(res.data.description);
      setImage(res.data.picture);
      setIngredients(res.data.ingredients);
      setInstructions(res.data.instructions);
    } catch (err) {
      console.error(err);
      navigate('/edit/not-found');
    }
  });

  const handleSubmitRecipe = async () => {
    if (isLoading()) return;
    setIsLoading(true);
    try {
      await axios.put('/recipe/edit', {
        id: Number.parseInt(id),
        title: name(),
        description: description(),
        ingredients: ingredients(),
        instructions: instructions(),
        image: image()!.split(',')[1],
      });
      setIsLoading(false);
      navigate('/for-you');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>Failed to edit recipe</span>
        </div>,
        2000
      );
    }
  };

  const addSnackBar = (element: JSXElement, ms: number) => {
    setSnackBarElements([...snackBarElements(), element]);
    setTimeout(() => {
      setSnackBarElements(snackBarElements().filter((obj) => element != obj));
    }, ms);
  };

  const goToStep = (index: number) => {
    // Check if they are signed in first
    if (!user()) {
      (
        window as Window & typeof globalThis & { unauthenticated_modal: any }
      ).unauthenticated_modal.showModal();
      return;
    }

    console.log(`index = ${index}, name = ${name}`);
    if (index > 0 && !name()) {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>Your recipe must have a name</span>
        </div>,
        2000
      );
      return;
    }

    if (index > 1 && ingredients().length == 0) {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>You must have at least one ingredient</span>
        </div>,
        2000
      );
      return;
    }

    if (index > 2 && instructions().length == 0) {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>You must have at least one instruction</span>
        </div>,
        2000
      );
      return;
    }

    if (index > 3 && !image()) {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>You must upload an image</span>
        </div>,
        2000
      );
      return;
    }

    setStep(index);
  };
  const nextStep = () => {
    if (step() >= 4) return;
    goToStep(step() + 1);
  };

  const previousStep = () => {
    if (step() <= 0) return;
    goToStep(step() - 1);
  };

  return (
    <div class="flex flex-col">
      <Navbar />
      {
        [
          <Name
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
          />,
          <Ingredients
            ingredients={ingredients}
            setIngredients={setIngredients}
            addSnackBar={addSnackBar}
          />,
          <Instructions
            instructions={instructions}
            setInstructions={setInstructions}
          />,
          <ImageStep
            image={image}
            setImage={setImage}
            imageName={imageName}
            setImageName={setImageName}
          />,
          <Confirm
            image={image}
            name={name}
            ingredients={ingredients}
            instructions={instructions}
          />,
        ][step()]
      }
      <span class="btm-nav btm-nav-xs h-fit bg-base-100 m-0 p-6 flex w-screen">
        <div class="flex py-2 rounded-xl  w-full flex-row gap-4 justify-between items-center">
          <StepProgressBar
            step={step}
            setStep={goToStep}
          />
          <div class="flex flex-row gap-4 px-12">
            <button
              onClick={previousStep}
              class={`btn ${step() == 0 ? 'hidden' : ''}`}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step() == 4) {
                  handleSubmitRecipe();
                } else {
                  nextStep();
                }
              }}
              class={`btn btn-primary `}
            >
              {step() == 4 ? "Let's Go!" : 'Continue'}
            </button>
          </div>
        </div>
      </span>
      <div
        class={`${
          snackBarElements().length == 0 ? 'hidden' : ''
        }toast toast-start z-50`}
      >
        {snackBarElements()}
      </div>
      <dialog
        id="unauthenticated_modal"
        class="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          class="modal-box"
        >
          <h3 class="text-lg">You must be signed in to create a recipe</h3>
          <div class="modal-action">
            <A
              href="/auth/options"
              class="btn btn-primary"
            >
              Sign In
            </A>
          </div>
        </form>
      </dialog>
      <div
        class={`fixed top-0 left-0 w-screen z-1000 h-screen justify-center items-center ${
          isLoading() ? 'flex' : 'hidden'
        } bg-white/5`}
      >
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>
  );
}
