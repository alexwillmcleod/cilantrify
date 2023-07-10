import { Signal } from 'solid-js';

interface NameProps {
  name: () => string;
  setName: (newName: string) => void;
}

export default function Name(props: NameProps) {
  const handleNameChange = (e: any) => {
    props.setName(e.target.value);
  };

  return (
    <div class="flex flex-col gap-4 justify-center items-center p-20">
      <p class="text-display font-bold text-xl">Name your recipe</p>
      <input
        class="input input-bordered w-full max-w-xs"
        value={props.name()}
        onChange={handleNameChange}
      />
    </div>
  );
}
