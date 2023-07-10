import { Accessor } from 'solid-js';

interface NameProps {
  name: () => string;
  setName: (newName: string) => void;
  description: Accessor<string>;
  setDescription: (newDescription: string) => void;
}

export default function Name(props: NameProps) {
  const handleNameChange = (e: any) => {
    props.setName(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    props.setDescription(e.target.value);
  };

  return (
    <div class="flex flex-col gap-8 justify-center items-center p-20 mb-16">
      <span class="flex flex-col gap-4 w-full justify-center items-center">
        <p class="text-display text-xl">Name your recipe</p>
        <input
          class="input input-bordered w-full max-w-xs text-lg"
          value={props.name()}
          onChange={handleNameChange}
        />
      </span>

      <span class="flex flex-col gap-4 w-full justify-center items-center">
        <p class="text-display text-xl">Create a description</p>
        <textarea
          class="textarea textarea-bordered w-full max-w-xs text-lg"
          placeholder="Optional"
          value={props.description()}
          onChange={handleDescriptionChange}
        />
      </span>
    </div>
  );
}
