import PlusIcon from '../../assets/plus-icon.svg';
import { useContext } from 'react';
import Info from '../../assets/info.svg';
import IngredientListElement from /*IngredientListProps*/ './IngredientListElement';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRecipeContext } from '../../main';
import ContinueButton from '../../components/ContinueButton';

export default function RecipeCreateIngredients() {
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSelectElement>(null);
  const navigate = useNavigate();
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createRecipeContext = useContext(CreateRecipeContext);

  const handleContinueClick = () => {
    // We are going to save this information in localStorage
    // We are then going to navigate to the next page
    if (createRecipeContext.title == '') {
      setErrorMessage('You must have a title');
      setIsErrorVisible(true);
      return;
    }
    if (createRecipeContext.ingredients.length == 0) {
      setErrorMessage('You must add at least one ingredient');
      setIsErrorVisible(true);
      return;
    }
    navigate('/recipe/create/instructions');
  };

  const handleReturnClick = () => {
    navigate('/dashboard');
  };

  const handleAddElement = () => {
    const name = nameRef.current?.value;
    const amount = amountRef.current?.valueAsNumber;
    const measurement: 'g' | 'mg' | 'kg' | 'mL' | 'L' | 'units' = measurementRef
      .current?.value as 'g' | 'mg' | 'kg' | 'mL' | 'L' | 'units';
    console.log(
      `creating element with name ${name}, amount ${amount} ${measurement}`
    );
    if (!name || !amount || !measurement) return;
    createRecipeContext.setIngredients([
      ...createRecipeContext.ingredients,
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
    createRecipeContext.setIngredients(
      createRecipeContext.ingredients.filter((_, i) => i != index)
    );
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
              value={createRecipeContext.title}
              onChange={(e) => createRecipeContext.setTitle(e.target.value)}
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
                  <option>g</option>
                  <option>mg</option>
                  <option>kg</option>
                  <option>mL</option>
                  <option>L</option>
                  <option>units</option>
                </select>
                <button onClick={handleAddElement}>
                  <img src={PlusIcon} />
                </button>
              </span>
            </div>
            <div className="flex flex-col bg-accent-blue-clear p-4 rounded-xl w-80 gap-2 overflow-y-scroll overflow-x-hidden max-h-60">
              {createRecipeContext.ingredients.map((element, index) => (
                <IngredientListElement
                  {...element}
                  index={index}
                  onDelete={handleDeleteElement}
                />
              ))}
              {createRecipeContext.ingredients.length == 0 ? (
                <p>No Ingredients</p>
              ) : (
                <></>
              )}
            </div>
            <ContinueButton
              onClick={handleContinueClick}
              isErrorVisible={isErrorVisible}
              errorMessage={errorMessage}
              onReturn={handleReturnClick}
            />
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
