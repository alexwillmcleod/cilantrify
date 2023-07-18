import InstructionElement from './InstructionElement';
import { Accessor, createSignal } from 'solid-js';

interface InstructionsProps {
  instructions: Accessor<string[]>;
  setInstructions: Function;
}

export default function Instructions({
  instructions,
  setInstructions,
}: InstructionsProps) {
  const [newInstruction, setNewInstruction] = createSignal<string>('');
  const [editedInstruction, setEditedInstruction] = createSignal<string>('');
  const [editedIndex, setEditedIndex] = createSignal<number>(0);

  const handleRemoveElement = (index: number) => {
    setInstructions(instructions().filter((_: any, i: number) => i != index));
  };

  const handleAddElement = () => {
    setInstructions([...instructions(), newInstruction()]);
    setNewInstruction('');
  };

  const handleEditElement = (index: number) => {
    setEditedIndex(index);
    setEditedInstruction(instructions()[index]);
    (
      window as Window & typeof globalThis & { edit_instructions_modal: any }
    ).edit_instructions_modal.showModal();
  };

  const handleUpdateElement = () => {
    setInstructions([
      ...instructions().slice(0, editedIndex()),
      editedInstruction(),
      ...instructions().slice(editedIndex() + 1),
    ]);
  };

  return (
    <div class="flex flex-col gap-4 justify-center items-center p-20">
      <span class="flex flex-row gap-4 justify-center items-center">
        <p class="text-display font-bold text-xl">Instructions</p>
        <button
          onClick={() =>
            (
              window as Window &
                typeof globalThis & { add_instructions_modal: any }
            ).add_instructions_modal.showModal()
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

      {instructions().map((value: string, index: number) => (
        <InstructionElement
          value={value}
          index={index}
          handleRemoveElement={handleRemoveElement}
          handleEditElement={handleEditElement}
        />
      ))}
      {(instructions() as string[]).length == 0 ? (
        <p class="pt-10">No instructions. Add some to get started</p>
      ) : (
        <></>
      )}

      <dialog
        id="add_instructions_modal"
        class="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          class="modal-box flex flex-col gap-5 p-10"
        >
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 class="font-bold text-lg">Add Instruction</h3>
          <div class="flex flex-col gap-1 w-full">
            <textarea
              onChange={(e) => setNewInstruction(e.target.value)}
              value={newInstruction()}
              placeholder="Type here"
              class="textarea textarea-bordered textarea-lg resize-none sm:resize w-full max-w-full"
            />
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
        id="edit_instructions_modal"
        class="modal modal-bottom sm:modal-middle"
      >
        <form
          method="dialog"
          class="modal-box flex flex-col gap-5 p-10"
        >
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
          <h3 class="font-bold text-lg">Edit Instruction</h3>
          <div class="flex flex-col gap-1 w-full">
            <textarea
              onChange={(e) => setEditedInstruction(e.target.value)}
              value={editedInstruction()}
              placeholder="Type here"
              class="textarea textarea-bordered textarea-lg resize-none sm:resize w-full max-w-full"
            />
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
