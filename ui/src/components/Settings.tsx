import { Accessor, createEffect, createSignal } from 'solid-js';
import defaultAvatar from '/default-avatar.svg';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

interface SettingsProps {
  isVisible: Accessor<boolean>;
}

export default function Settings({ isVisible }: SettingsProps) {
  const { user, setProfilePicture } = useAuth()!;

  createEffect(() => {
    if (isVisible()) {
      (
        window as Window & typeof globalThis & { settings_modal: any }
      ).settings_modal.showModal();
    } else {
      (
        window as Window & typeof globalThis & { settings_modal: any }
      ).settings_modal.close();
    }
  });

  const uploadNewProfileImage = async (e: any) => {
    const file = e.target.files[0];
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
      let width = 800;
      let height = 800;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx!.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 1); // Adjust compression quality as needed

      setNewProfileImage(compressedBase64);
      setIsProfileImageChanged(true);
    };

    reader.readAsDataURL(file);
  };

  const [newProfileImage, setNewProfileImage] = createSignal<string>(
    (user() && user()!.picture ? user()!.picture : defaultAvatar) as string
  );
  const [isProfileImageChanged, setIsProfileImageChanged] =
    createSignal<boolean>(false);

  const onSave = async () => {
    if (isProfileImageChanged()) {
      try {
        await axios.put('/profile/update-profile-picture', {
          image: newProfileImage()!.split(',')[1],
        });
        setProfilePicture(newProfileImage() as string);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <dialog
      id="settings_modal"
      class="modal modal-bottom sm:modal-middle"
    >
      <form
        method="dialog"
        class="modal-box flex flex-col gap-4"
      >
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
        <h3 class="font-bold text-lg">Settings</h3>
        <div class="flex flex-row gap-4">
          {/* <ul class="menu bg-base-200 w-fit rounded-xl h-full">
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Item 2</a>
            </li>
            <li>
              <a>Item 3</a>
            </li>
          </ul> */}
          <div class="flex flex-col gap-4 w-full">
            <p>Profile Settings</p>
            <label>
              <span class="btn btn-xs p-4 w-full sm:max-w-xs h-fit flex flex-row gap-4 items-center ">
                <img
                  class="rounded-full w-12"
                  src={newProfileImage() as string}
                />
                <p class="text-md">Change Profile Picture</p>
              </span>
              <input
                type="file"
                class="hidden"
                onChange={uploadNewProfileImage}
              ></input>
            </label>
            <div class="flex flex-row w-full justify-end">
              <button
                onClick={onSave}
                class="btn btn-primary w-16"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  );
}
