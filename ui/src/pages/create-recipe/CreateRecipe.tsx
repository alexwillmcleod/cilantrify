import Navbar from '../../components/Navbar';
import { createEffect, createSignal, Signal } from 'solid-js';
import Ingredients from './Ingredients';
import Instructions from './Instructions';
import Name from './Name';
import Image from './Image';
import Confirm from './Confirm';

const StepProgressBar = (props: any) => (
  <div class="w-[50vw] steps invisible md:visible steps-horizontal">
    <button
      onClick={() => props.setStep(0)}
      class={`step ${props.step() >= 0 ? 'step-primary' : ''}`}
    >
      Name
    </button>
    <button
      onClick={() => props.setStep(1)}
      class={`step ${props.step() >= 1 ? 'step-primary' : ''}`}
    >
      Ingredients
    </button>
    <button
      onClick={() => props.setStep(2)}
      class={`step ${props.step() >= 2 ? 'step-primary' : ''}`}
    >
      Instructions
    </button>
    <button
      onClick={() => props.setStep(3)}
      class={`step ${props.step() >= 3 ? 'step-primary' : ''}`}
    >
      Image
    </button>
    <button
      onClick={() => props.setStep(4)}
      class={`step ${props.step() >= 4 ? 'step-primary' : ''}`}
    >
      Confirm
    </button>
  </div>
);

export default function CreateRecipe() {
  const [step, setStep]: [Function, Function] = createSignal<number>(0);

  const [name, setName] = createSignal<string>('');

  const nextStep = () => {
    if (step() >= 4) return;
    setStep(step() + 1);
  };

  const previousStep = () => {
    if (step() <= 0) return;
    setStep(step() - 1);
  };

  return (
    <div>
      <Navbar />
      {
        [
          <Name
            name={name}
            setName={setName}
          />,
          <Ingredients />,
          <Instructions />,
          <Image />,
          <Confirm />,
        ][step()]
      }
      <span class="flex flex-row gap-4 justify-between items-center bottom-12 absolute w-screen">
        <StepProgressBar
          step={step}
          setStep={setStep}
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
            Continue
          </button>
        </div>
      </span>
    </div>
  );
}
