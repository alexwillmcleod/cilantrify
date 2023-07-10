import verticalThreeDots from '/vertical-three-dots.svg';

export interface IngredientElementProps {
  name: string;
  amount: number;
  measurement: 'mL' | 'L' | 'g' | 'ng' | 'kg' | 'Units';
}

export default function IngredientElement({
  name,
  amount,
  measurement,
  index,
  handleRemoveElement,
}: IngredientElementProps & {
  index: number;
  handleRemoveElement: (index: number) => void;
}) {
  return (
    <div class="card w-96 pt-4 bg-base-100 shadow-xl">
      <div class="card-body relative">
        <div class="card-actions absolute top-4 right-4">
          <div class="dropdown dropdown-bottom">
            <label
              tabindex="0"
              class="btn btn-sm btn-ghost m-1"
            >
              <svg
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 fill-neutral-400"
              >
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              </svg>
            </label>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {/* <li>
                <button class="flex flex-col justify-center items-center">
                  Edit
                </button>
              </li> */}
              <li>
                <button
                  onClick={() => handleRemoveElement(index)}
                  class="text-error flex flex-col justify-center items-center"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>
        </div>
        <p class="text-ellipsis overflow-hidden font-bold pr-10">{name}</p>
        <p>
          {amount}
          {measurement != 'Units' ? measurement : ''}
        </p>
      </div>
    </div>
  );
}
