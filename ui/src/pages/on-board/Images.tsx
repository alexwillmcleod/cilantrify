import ImagesGraphic from '../../assets/images.svg';
import AddImageIcon from '../../assets/add-image-icon.svg';
import { useFilePicker } from 'use-file-picker';
import { useNavigate } from 'react-router';
import { CreateRecipeContext } from '../../main';
import { useContext } from 'react';

export default function OnBoardImages() {
  const navigate = useNavigate();
  const createRecipeContext = useContext(CreateRecipeContext);
  const [openFileSelector, { filesContent, loading, errors }] = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: false,
    limitFilesConfig: {
      max: 1,
    },
    maxFileSize: 50,
    imageSizeRestrictions: {
      maxHeight: 2160,
      maxWidth: 3840,
      minHeight: 300,
      minWidth: 384,
    },
  });

  const handleContinueClick = () => {
    if (filesContent.length > 0 && filesContent[0].content) {
      createRecipeContext.setImage(filesContent[0].content);
    }
    navigate('/recipe/create/success');
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-row gap-10 px-10 py-4">
        <div className="flex flex-col gap-8">
          <p className="font-display text-lg text-accent-blue">
            What does it look like?
          </p>
          <button
            className="w-64 h-64 bg-accent-blue-clear rounded-xl flex justify-center items-center flex-col"
            onClick={() => openFileSelector()}
          >
            <img
              src={AddImageIcon}
              className="w-20 h-20"
            />
            <p className="font-bold text-accent-blue">Add some photos</p>
          </button>
          <button
            onClick={handleContinueClick}
            className="w-fit px-4 py-2 bg-accent-blue text-white rounded-xl"
          >
            Continue
          </button>
        </div>
        <div className="flex flex-col justify-center items-center max-md:hidden">
          <img
            src={ImagesGraphic}
            width={400}
          />
        </div>
      </div>
    </div>
  );
}
