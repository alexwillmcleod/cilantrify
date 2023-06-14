import PlusIcon from '../../assets/plus-icon.svg';
import Info from '../../assets/info.svg';
import CrossIcon from '../../assets/cross-icon.svg';
import EditIcon from '../../assets/edit.svg';
import FlowersPerson from '../../assets/flowers.svg';
import IngredientListElement, {
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
import { CreateRecipeContext } from '../../main';
import { useNavigate } from 'react-router-dom';

export default function RecipeCreateInstructions() {
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSelectElement>(null);
  const navigate = useNavigate();

  const createRecipeContext = useContext(CreateRecipeContext);

  // const [editorState, setEditorState] = useState<'edit' | 'remove' | 'normal'>(
  //   'normal'
  // );

  // const handleInstructionClick = (index: number) => {
  //   if (editorState == 'remove') {
  //     handleDeleteElement(index);
  //   }
  // };

  const handleContinueClick = () => {
    // We are going to save this information in localStorage
    // We are then going to navigate to the next page
    navigate('/recipe/create/images');
  };

  const handleAddElement = () => {
    const name = nameRef.current?.value;
    if (!name) return;
    createRecipeContext.setInstructions([
      ...createRecipeContext.instructions,
      name,
    ]);
    nameRef.current.value = '';
  };

  const handleDeleteElement = (index: number) => {
    createRecipeContext.setInstructions(
      createRecipeContext.instructions.filter((_, i) => i != index)
    );
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-10 px-10 py-4">
        <div className="flex flex-col gap-8">
          <p className="font-display text-lg text-accent-blue">
            Let's add some instructions
          </p>
          <span className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <span className="flex flex-row gap-2 ">
                <input
                  className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
                  ref={nameRef}
                />
                <button onClick={handleAddElement}>
                  <img src={PlusIcon} />
                </button>
              </span>
            </div>
            <div className="flex flex-col justify-left items-left w-80 overflow-y-scroll overflow-x-hidden max-h-60">
              {createRecipeContext.instructions.map((element, index) => (
                <button
                  className="p-0 bg-transparent text-left m-0 w-fit hover:text-accent-red hover:line-through"
                  onClick={() => handleDeleteElement(index)}
                >
                  {index + 1}. {element}
                </button>
              ))}
              {createRecipeContext.instructions.length == 0 ? (
                <p>No Instructions</p>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col gap-10">
              <button
                onClick={handleContinueClick}
                className="w-fit px-4 py-2 bg-accent-blue text-white rounded-xl"
              >
                Continue
              </button>
            </div>
          </span>
        </div>
        <div className="flex flex-col justify-center items-center max-md:hidden">
          <img
            src={FlowersPerson}
            width={400}
          />
        </div>
      </div>
    </div>
  );
}
