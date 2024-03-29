import { Accessor, createEffect, createSignal, onMount } from 'solid-js';
import defaultAvatar from '/default-avatar.svg';
import settingsIcon from '/settings-icon.svg';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { usePreferences } from '../hooks/PreferencesContext';

interface SettingsProps {
  isVisible: Accessor<boolean>;
}
export default function Settings({ isVisible }: SettingsProps) {
  const { user, setProfilePicture, setProfileBio } = useAuth()!;
  const { measurementSystem, setMeasurementSystem } = usePreferences()!;

  const getBio = () => {
    if (user() && user()!.bio) {
      return user()!.bio!;
    } else {
      return '';
    }
  };
  const [bio, setBio] = createSignal<string>(getBio());

  let measurementUnitRef: HTMLInputElement | undefined;

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

  createEffect(() => {
    if (measurementSystem() == 'metric') {
      measurementUnitRef!.checked = true;
    } else {
      measurementUnitRef!.checked = false;
    }
  });

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
    if (bio() != user()!.bio) {
      try {
        await axios.put('/profile/update-profile-bio', {
          bio: bio(),
        });
        setProfileBio(bio());
      } catch (err) {
        console.error(err);
      }
    }
    // Update measurement units
    if (measurementUnitRef && measurementUnitRef!.checked) {
      setMeasurementSystem('metric');
    } else {
      setMeasurementSystem('imperial');
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
        <h3 class="font-bold text-xl flex flex-row gap-3">
          <img src={settingsIcon} /> Settings
        </h3>
        <div class="flex flex-col gap-4 justify-center">
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
          <div class="flex flex-col gap-4 w-full justify-center">
            <p>Profile Picture</p>
            <label class="flex justify-center w-full">
              <span class="btn p-4 w-full h-fit flex flex-row gap-4 items-center">
                <img
                  class="rounded-full w-24 justify-center"
                  src={newProfileImage() as string}
                />
                <p class="text-lg">Change Profile Picture</p>
              </span>
              <input
                type="file"
                class="hidden"
                onChange={uploadNewProfileImage}
              ></input>
            </label>
            <p>Bio</p>
            <textarea
              class="textarea textarea-bordered max-w-full"
              value={bio()}
              onChange={(e) => {
                setBio(e.target.value);
              }}
            ></textarea>
          </div>
          <div class="flex flex-col gap-4 w-full justify-start">
            <p>Measurement Units</p>
            <label class="swap swap-flip text-xl">
              <input
                id="measurement-system"
                type="checkbox"
                class="hidden"
                ref={measurementUnitRef}
              />

              <div class="swap-on">Metric 🌍</div>
              <div class="swap-off">Imperial 🗽</div>
            </label>
          </div>
          <div class="flex flex-row w-full justify-end">
            <button
              onClick={onSave}
              class="btn btn-primary w-16"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
