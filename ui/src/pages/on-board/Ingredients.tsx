import PlusIcon from '../../assets/plus-icon.svg';
import Info from '../../assets/info.svg';
import IngredientListElement, {
  IngredientListElementProps,
  IngredientListProps,
} from './IngredientListElement';
import {
  useState,
  useRef,
  useContext,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecipeCreateIngredients() {
  const recipeTitleRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSelectElement>(null);
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState<IngredientListProps[]>([]);

  useEffect(() => {
    // We are going to get any of the values from localStorage
    if (localStorage.getItem('ingredients')) {
      setIngredients(JSON.parse(localStorage.getItem('ingredients')!));
    }
    if (localStorage.getItem('recipe-title')) {
      recipeTitleRef.current!.value = localStorage.getItem('recipe-title')!;
    }
  }, []);

  const handleContinueClick = () => {
    // We are going to save this information in localStorage
    // We are then going to navigate to the next page
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    localStorage.setItem('recipe-title', recipeTitleRef.current!.value);
    navigate('/recipe/create/instructions');
  };

  const handleAddElement = () => {
    const name = nameRef.current?.value;
    const amount = amountRef.current?.valueAsNumber;
    const measurement: 'g' | 'mL' | 'mg' | 'kg' | 'L' = measurementRef.current
      ?.value as 'g' | 'mL' | 'mg' | 'kg' | 'L';
    console.log(
      `creating element with name ${name}, amount ${amount} ${measurement}`
    );
    if (!name || !amount || !measurement) return;
    setIngredients([
      ...ingredients,
      {
        name: name!,
        amount: amount!,
        measurement: measurement!,
      },
    ]);
    nameRef.current.value = '';
    amountRef.current.value = '';
  };

  const handleDeleteElement = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i != index));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-10 px-10 py-4">
        <div className="flex flex-col gap-8">
          <p className="font-display text-lg text-accent-blue">
            Let's create a recipe
          </p>
          <span className="flex flex-col gap-2 ">
            <p className="font-sans text-md text-accent-blue">
              What should we call it?
            </p>
            <input
              className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
              ref={recipeTitleRef}
            />
          </span>
          <span className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <span className="flex flex-col gap-2 ">
                <p className="font-sans text-md text-accent-blue">
                  What ingredients are in it?
                </p>
                <input
                  className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
                  ref={nameRef}
                />
              </span>
              <span className="flex flex-row gap-4 items-center">
                <input
                  type="number"
                  defaultValue={0}
                  placeholder="Volume"
                  className="w-[10.4rem] px-4 py-2 bg-accent-blue-clear rounded-lg"
                  ref={amountRef}
                ></input>
                <select
                  className="w-20 px-4 py-2 bg-accent-blue-clear rounded-lg"
                  ref={measurementRef}
                >
                  <option value="g">g</option>
                  <option value="mg">mg</option>
                  <option value="kg">kg</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                </select>
                <button onClick={handleAddElement}>
                  <img src={PlusIcon} />
                </button>
              </span>
            </div>
            <div className="flex flex-col bg-accent-blue-clear p-4 rounded-xl w-80 gap-2 overflow-y-scroll overflow-x-hidden max-h-60">
              {ingredients.map((element, index) => (
                <IngredientListElement
                  {...element}
                  index={index}
                  onDelete={handleDeleteElement}
                />
              ))}
              {ingredients.length == 0 ? <p>No Ingredients</p> : <></>}
            </div>
            <button
              onClick={handleContinueClick}
              className="w-fit px-4 py-2 bg-accent-blue text-white rounded-xl"
            >
              Continue
            </button>
          </span>
        </div>
        <div className="flex flex-col justify-center items-center max-md:hidden">
          <img
            src={Info}
            width={400}
          />
        </div>
      </div>
    </div>
  );
}
