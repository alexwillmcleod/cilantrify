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
import ContinueButton from '../../components/ContinueButton';

export default function RecipeCreateInstructions() {
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSelectElement>(null);
  const navigate = useNavigate();
  const [isErrorVisible, setIsErrorVisible] = useState(false);

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
    if (createRecipeContext.instructions.length == 0) {
      setIsErrorVisible(true);
      return;
    }
    navigate('/recipe/create/images');
  };

  const handleReturnClick = () => {
    navigate('../ingredients');
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
              <span className="flex flex-col gap-2 ">
                <textarea
                  className="max-w-2xl w-96 max-h-96 h-48 px-4 py-2 bg-accent-blue-clear rounded-lg resize"
                  ref={nameRef}
                />
              </span>
            </div>

            <div className="flex flex-col gap-10">
              <ContinueButton
                errorMessage="You must add at least one instruction"
                onClick={handleContinueClick}
                isErrorVisible={isErrorVisible}
                onReturn={handleReturnClick}
              >
                <button
                  onClick={handleAddElement}
                  className="bg-accent-green text-white px-4 py-2 rounded-xl h-fit"
                >
                  Add
                </button>
              </ContinueButton>
            </div>
          </span>
        </div>
        <div className="flex flex-col items-center ">
          {createRecipeContext.instructions.length == 0 ? (
            <p>No Instructions</p>
          ) : (
            <></>
          )}
          <div className="flex flex-col justify-left items-left w-96 overflow-y-auto overflow-x-hidden max-h-80 gap-4">
            {createRecipeContext.instructions.map((element, index) => (
              <button
                className="p-0 bg-transparent text-left m-0 w-fit hover:text-accent-red hover:line-through"
                onClick={() => handleDeleteElement(index)}
              >
                {index + 1}. {element}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
