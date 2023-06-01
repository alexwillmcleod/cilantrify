import CrossIcon from '../../assets/cross-icon.svg';
import { MouseEventHandler } from 'react';

export interface IngredientListProps {
  name: string;
  amount: number;
  measurement: 'Grams' | 'Millilitres' | 'Milligrams' | 'Kilograms' | 'Litres';
}

export interface IngredientListElementProps {
  index: number;
  onDelete: Function;
}

export default function IngredientListElement({
  name,
  amount,
  measurement,
  onDelete,
  index,
}: IngredientListElementProps & IngredientListProps) {
  return (
    <div className="flex flex-row bg-accent-blue-clear rounded-xl px-4 py-2 justify-between">
      <span className="flex flex-col">
        <p className="text-accent-blue">{name}</p>
        <p className="text-accent-dark-green">
          {amount} {measurement}
        </p>
      </span>
      {onDelete && index != undefined ? (
        <button>
          <img
            src={CrossIcon}
            onClick={() => onDelete(index)}
          />
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
