import { MouseEventHandler } from 'react';
import BackArrowIcon from '../assets/chevron-left.svg';
import DangerIcon from '../assets/danger.svg';

interface ContinueButtonProps {
  isErrorVisible: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  errorMessage: string;
  onReturn?: MouseEventHandler<HTMLButtonElement>;
  children?: JSX.Element;
}

export default function ContinueButton(props: ContinueButtonProps) {
  return (
    <span className="flex flex-col gap-4 relative">
      <span className="flex flex-row gap-4 items-center justify-between">
        {props.onReturn ? (
          <button
            className="w-14 rounded-xl"
            onClick={props.onReturn}
          >
            <img
              className="w-25 fill-accent-blue"
              src={BackArrowIcon}
            />
          </button>
        ) : (
          <div className="invisible" />
        )}
        <div className="flex flex-row gap-2 items-center">
          {props.children}
          <button
            onClick={props.onClick}
            className="w-fit px-4 py-2 bg-accent-blue text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </span>

      <p
        className={`text-bright-red absolute text-right w-full top-16 ${
          props.isErrorVisible ? '' : 'hidden'
        }`}
      >
        {props.errorMessage}
      </p>
    </span>
  );
}
