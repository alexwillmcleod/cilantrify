import { useState } from 'react';
import Modal from './Modal';

interface UserIconProps {
  src: string;
}

export default function UserIcon(props: UserIconProps) {
  const [isModalShowing, setIsModalShowing] = useState(false);

  return (
    <>
      {' '}
      <button onClick={() => setIsModalShowing(!isModalShowing)}>
        <img
          className="w-12 sm:w-14 rounded-full"
          src={props.src}
        />
      </button>
    </>
  );
}
