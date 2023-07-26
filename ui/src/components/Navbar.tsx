import defaultAvatar from '/default-avatar.svg';
import appLogo from '/whisk-logo.svg';
import { A, useNavigate } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';
import Settings from './Settings';
import { createSignal } from 'solid-js';

export default function Navbar() {
  const { user, handleLogout } = useAuth()!;
  const [isSettingsVisible, setIsSettingsVisible] =
    createSignal<boolean>(false);
  const navigate = useNavigate();
  return (
    <>
      <div class="navbar bg-base-100 p-10 z-10 sticky top-0">
        {/* <div class="navbar-start"></div> */}
        <div class="navbar-start">
          <A
            href={user() == undefined ? '/' : '/explore'}
            class="flex flex-row gap-3 items-center"
          >
            <img
              class="w-16 md:w-12"
              src={appLogo}
            />
            <p class="hidden font-display font-bold text-primary text-4xl md:flex">
              Cilantrify
            </p>
          </A>
        </div>
        {/* <div class="navbar-center">
        <div class="flex flex-row gap-4 justify-center items-center w-full max-w-xs">
          <span class="flex flex-row ">
            <input
              type="text"
              placeholder="Search"
              class="input input-bordered w-full max-w-xs"
            />
            <button class="btn btn-ghost ">
              <img src={searchIcon} />
            </button>
          </span>
        </div>
      </div> */}
        <div class="navbar-end flex-row gap-12">
          <div class="dropdown dropdown-end">
            <label
              tabindex="0"
              class="w-16 h-16 btn btn-ghost btn-circle avatar"
            >
              <img
                class="rounded-full"
                src={
                  user() && user()!.picture ? user()!.picture : defaultAvatar
                }
              />
            </label>
            <ul
              tabindex="0"
              class="menu menu-lg sm:menu-md dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {user() && (
                <li>
                  <a class="justify-between">
                    Profile
                    <span class="badge">New</span>
                  </a>
                </li>
              )}
              {user() && (
                <li>
                  <button
                    onClick={() => {
                      setIsSettingsVisible(false);
                      setIsSettingsVisible(true);
                    }}
                  >
                    Settings
                  </button>
                </li>
              )}
              {user() ? (
                <li>
                  <button
                    class="text-error"
                    onClick={() => {
                      handleLogout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => {
                      navigate('/auth/options');
                    }}
                  >
                    Sign In
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <Settings isVisible={isSettingsVisible} />
    </>
  );
}
