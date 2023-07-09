import Navbar from '../../components/Navbar';
import { createEffect, createSignal, JSXElement, Signal } from 'solid-js';
import Ingredients from './Ingredients';
import Instructions from './Instructions';
import Name from './Name';
import Image from './Image';
import Confirm from './Confirm';
import { IngredientElementProps } from './IngredientElement';

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

export default function CreateRecipe() {
  const [step, setStep]: [Function, Function] = createSignal<number>(0);

  const [snackBarElements, setSnackBarElements] = createSignal<JSXElement[]>(
    []
  );

  const [name, setName] = createSignal<string>('');
  const [ingredients, setIngredients] = createSignal<IngredientElementProps[]>(
    []
  );
  const [instructions, setInstructions] = createSignal<string[]>([]);
  const [image, setImage] = createSignal<File | undefined>(undefined);
  const [imageName, setImageName] = createSignal<string>('');

  const addSnackBar = (element: JSXElement, ms: number) => {
    setSnackBarElements([...snackBarElements(), element]);
    setTimeout(() => {
      setSnackBarElements(snackBarElements().filter((obj) => element != obj));
    }, ms);
  };

  const goToStep = (index: number) => {
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
          />,
          <Ingredients
            ingredients={ingredients}
            setIngredients={setIngredients}
          />,
          <Instructions
            instructions={instructions}
            setInstructions={setInstructions}
          />,
          <Image
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
      <span class="btm-nav flex w-screen p-10">
        <div class="flex px-6 py-20 bg-base-100 rounded-xl w-full flex-row gap-4 justify-between items-center">
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
              onClick={nextStep}
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
    </div>
  );
}
