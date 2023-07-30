import defaultAvatar from '/default-avatar.svg';
import appLogo from '/whisk-logo.svg';
import { A, useNavigate } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';
import Settings from './Settings';
import { createEffect, createSignal, Show } from 'solid-js';
import SearchBar from './SearchBar';
import { useSearch } from '../hooks/SearchContext';

interface NavbarProps {
  isSearchBarVisible: boolean;
  isShouldRedirect: boolean;
}

export default function Navbar({
  isShouldRedirect,
  isSearchBarVisible,
}: NavbarProps) {
  const { searchTerm, setSearchTerm } = useSearch()!;
  const { user, handleLogout } = useAuth()!;
  const [isSettingsVisible, setIsSettingsVisible] =
    createSignal<boolean>(false);

  const navigate = useNavigate();

  createEffect(() => {
    if (searchTerm() != '' && isShouldRedirect) navigate('/explore');
  });

  return (
    <>
      <div class="navbar bg-base-100 py-5 px-10 sticky top-0">
        <div class="navbar-start">
          <A
            href={user() == undefined ? '/' : '/explore'}
            class="flex flex-row gap-3 items-center"
            onClick={() => setSearchTerm('')}
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

        <div class="navbar-end flex-row gap-4 w-full">
          <Show when={isSearchBarVisible}>
            <div class="lg:flex hidden navbar-center ">
              <div class="flex flex-row gap-4 justify-center items-center w-full max-w-3xl">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            </div>
          </Show>
          <div class="dropdown z-50 dropdown-end">
            <label
              tabindex="0"
              class="w-16 h-16 btn btn-ghost btn-circle avatar"
            >
              <Show
                when={user() && user()!.picture}
                fallback={
                  <img
                    class="rounded-full"
                    src={defaultAvatar}
                  />
                }
              >
                <img
                  class="rounded-full"
                  src={user()!.picture}
                />
              </Show>
            </label>

            <ul
              tabindex="0"
              class="menu menu-lg sm:menu-md dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <Show
                when={user()}
                fallback={
                  <li class="z-50">
                    <button
                      onClick={() => {
                        navigate('/auth/options');
                      }}
                    >
                      Sign In
                    </button>
                  </li>
                }
              >
                <li>
                  <A
                    href={`/profile/${user()!.id}`}
                    class="justify-between z-50"
                    onClick={() => setSearchTerm('')}
                  >
                    Profile
                    <span class="badge">New</span>
                  </A>
                </li>
                <li>
                  <button
                    class="z-50"
                    onClick={() => {
                      setIsSettingsVisible(false);
                      setIsSettingsVisible(true);
                    }}
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    class="text-error z-50"
                    onClick={() => {
                      handleLogout();
                      navigate('/');
                    }}
                  >
                    Logout
                  </button>
                </li>
              </Show>
            </ul>
          </div>
        </div>
      </div>
      <Settings isVisible={isSettingsVisible} />
      <Show when={isSearchBarVisible}>
        <div class="lg:hidden flex justify-center pb-8 px-6">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </Show>
    </>
  );
}
