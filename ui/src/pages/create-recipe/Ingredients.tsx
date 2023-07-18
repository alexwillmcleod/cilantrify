import IngredientElement, { IngredientElementProps } from './IngredientElement';
import { createSignal } from 'solid-js';

interface IngredientsProps {
  ingredients: Function;
  setIngredients: Function;
  addSnackBar: Function;
}

export default function Ingredients({
  ingredients,
  setIngredients,
  addSnackBar,
}: IngredientsProps) {
  const [newIngredientName, setNewIngredientName] = createSignal('');
  const [newIngredientAmount, setNewIngredientAmount] = createSignal('');
  const [newIngredientMeasurement, setNewIngredientMeasurement] =
    createSignal('Units');
  const [editedIngredientName, setEditedIngredientName] = createSignal('');
  const [editedIngredientAmount, setEditedIngredientAmount] = createSignal('');
  const [editedIngredientMeasurement, setEditedIngredientMeasurement] =
    createSignal('Units');
  const [editIndex, setEditIndex] = createSignal<number>(0);

  const handleRemoveElement = (index: number) => {
    setIngredients(ingredients().filter((_: any, i: number) => i != index));
  };

  const handleAddElement = () => {
    console.log('Adding element');
    if (newIngredientAmount() == '') {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>Ingredient amount must be selected</span>
        </div>,
        2000
      );
      return;
    }
    setIngredients([
      ...ingredients(),
      {
        name: newIngredientName(),
        amount: Number.parseInt(newIngredientAmount()),
        measurement: newIngredientMeasurement(),
      },
    ]);
    setNewIngredientName('');
    setNewIngredientAmount('');
    setNewIngredientMeasurement('Units');
  };

  const handleEditElement = (index: number) => {
    setEditedIngredientName(ingredients()[index].name);
    setEditedIngredientAmount(ingredients()[index].amount);
    setEditedIngredientMeasurement(ingredients()[index].measurement);
    (
      window as Window & typeof globalThis & { edit_ingredients_modal: any }
    ).edit_ingredients_modal.showModal();
    setEditIndex(index);
  };

  const handleUpdateElement = () => {
    if (editedIngredientAmount() == '') {
      addSnackBar(
        <div class="alert alert-error transition-all">
          <span>Ingredient amount must be selected</span>
        </div>,
        2000
      );
      return;
    }

    setIngredients([
      ...ingredients().slice(0, editIndex()),
      {
        name: editedIngredientName(),
        amount: editedIngredientAmount(),
        measurement: editedIngredientMeasurement(),
      },
      ...ingredients().slice(editIndex() + 1),
    ]);
    setEditedIngredientName('');
    setEditedIngredientAmount('');
    setEditedIngredientMeasurement('Units');
  };

  return (
    <div class="flex flex-col gap-4 justify-center items-center px-20 pt-10 pb-40">
      <span class="flex flex-row gap-4 justify-center items-center">
        <p class="text-display font-bold text-2xl">Ingredients</p>
        <button
          onClick={() =>
            (
              window as Window &
                typeof globalThis & { add_ingredients_modal: any }
            ).add_ingredients_modal.showModal()
          }
        >
          <svg
            class="fill-none w-7 h-7"
            viewBox="0 0 65 65"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M17.3225 0H47.645C58.695 0 65 6.24 65 17.3225V47.6775C65 58.695 58.7275 65 47.6775 65H17.3225C6.24 65 0 58.695 0 47.6775V17.3225C0 6.24 6.24 0 17.3225 0ZM35.165 35.1975H44.395C45.89 35.165 47.0925 33.9625 47.0925 32.4675C47.0925 30.9725 45.89 29.77 44.395 29.77H35.165V20.605C35.165 19.11 33.9625 17.9075 32.4675 17.9075C30.9725 17.9075 29.77 19.11 29.77 20.605V29.77H20.5725C19.8575 29.77 19.175 30.0625 18.655 30.55C18.1675 31.07 17.875 31.7493 17.875 32.4675C17.875 33.9625 19.0775 35.165 20.5725 35.1975H29.77V44.395C29.77 45.89 30.9725 47.0925 32.4675 47.0925C33.9625 47.0925 35.165 45.89 35.165 44.395V35.1975Z"
              class="fill-primary"
            />
          </svg>
        </button>
      </span>

      {ingredients().map(
        (
          { name, amount, measurement }: IngredientElementProps,
          index: number
        ) => (
          <IngredientElement
            name={name}
            amount={amount}
            measurement={measurement}
            index={index}
            handleRemoveElement={handleRemoveElement}
            handleEditElement={handleEditElement}
          />
        )
      )}
      {(ingredients() as IngredientElementProps[]).length == 0 ? (
        <p class="pt-10">No ingredients. Add some to get started</p>
      ) : (
        <></>
      )}

      <dialog
        id="add_ingredients_modal"
        class="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          class="modal-box flex flex-col gap-5 p-10"
        >
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 class="font-bold text-lg">Add Ingredient</h3>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Name</p>
            <input
              onChange={(e) => setNewIngredientName(e.target.value)}
              class="input font-normal input-bordered w-full max-w-xs"
              value={newIngredientName()}
            />
          </div>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Amount</p>
            <input
              onChange={(e) => setNewIngredientAmount(e.target.value)}
              type="number"
              class="input font-normal input-bordered w-full max-w-xs"
              value={newIngredientAmount()}
            />
          </div>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Measurement</p>
            <select
              onChange={(e) => setNewIngredientMeasurement(e.target.value)}
              class="select font-normal select-bordered w-full max-w-xs"
              value={newIngredientMeasurement()}
            >
              <option
                value="Units"
                selected
              >
                Units
              </option>
              <option>mL</option>
              <option>L</option>
              <option>g</option>
              <option>mg</option>
              <option>kg</option>
            </select>
          </div>
          <div class="modal-action">
            <button
              onClick={handleAddElement}
              class="btn btn-sm btn-primary"
            >
              Add
            </button>
            <button class="btn btn-sm">Cancel</button>
          </div>
        </form>
      </dialog>

      <dialog
        id="edit_ingredients_modal"
        class="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          class="modal-box flex flex-col gap-5 p-10"
        >
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 class="font-bold text-lg">Edit Ingredient</h3>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Name</p>
            <input
              onChange={(e) => setEditedIngredientName(e.target.value)}
              class="input font-normal input-bordered w-full max-w-xs"
              value={editedIngredientName()}
            />
          </div>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Amount</p>
            <input
              onChange={(e) => setEditedIngredientAmount(e.target.value)}
              type="number"
              class="input font-normal input-bordered w-full max-w-xs"
              value={editedIngredientAmount()}
            />
          </div>
          <div class="flex flex-col gap-1 ">
            <p class="text-display text-md">Measurement</p>
            <select
              onChange={(e) => setEditedIngredientMeasurement(e.target.value)}
              class="select font-normal select-bordered w-full max-w-xs"
              value={editedIngredientMeasurement()}
            >
              <option
                value="Units"
                selected
              >
                Units
              </option>
              <option>mL</option>
              <option>L</option>
              <option>g</option>
              <option>mg</option>
              <option>kg</option>
            </select>
          </div>
          <div class="modal-action">
            <button
              onClick={handleUpdateElement}
              class="btn btn-sm btn-primary"
            >
              Save
            </button>
            <button class="btn btn-sm">Cancel</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
