import { Accessor } from 'solid-js';

interface ImageProps {
  image: Accessor<File | undefined>;
  setImage: (newImage: File) => void;
  imageName: Accessor<string | undefined>;
  setImageName: (newImageName: string) => void;
}

export default function Image(props: ImageProps) {
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    props.setImage(file);
    props.setImageName(file.name);
    console.log(`Setting image name to ${file.name}`);
  };

  return (
    <div class="flex flex-col gap-4 justify-center items-center p-20">
      <p class="text-display font-bold text-xl">Select an Image</p>
      <input
        class="file-input w-full max-w-xs"
        type="file"
        onChange={handleFileUpload}
        // value={props.imageName()}
      />
    </div>
  );
}
