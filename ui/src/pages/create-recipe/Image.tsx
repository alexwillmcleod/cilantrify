import { Accessor } from 'solid-js';

interface ImageProps {
  image: Accessor<string | undefined>;
  setImage: (newImage: string) => void;
  imageName: Accessor<string | undefined>;
  setImageName: (newImageName: string) => void;
}

export default function ImageStep(props: ImageProps) {
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    props.setImageName(file.name);
    const reader = new FileReader();

    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result as string;
      await new Promise((resolve) => {
        img.onload = () => {
          // @ts-ignore
          resolve();
        };
      });

      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800; // Maximum width for the compressed image
      const MAX_HEIGHT = 600; // Maximum height for the compressed image
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx!.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 1); // Adjust compression quality as needed

      props.setImage(compressedBase64);
    };

    reader.readAsDataURL(file);
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
