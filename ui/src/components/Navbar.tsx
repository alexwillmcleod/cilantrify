import defaultAvatar from '/default-avatar.svg';
import { A, useNavigate } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, handleLogout } = useAuth()!;
  const navigate = useNavigate();
  return (
    <div class="navbar bg-base-100 p-10">
      {/* <div class="navbar-start"></div> */}
      <div class="navbar-start">
        <A
          href={user() == undefined ? '/' : '/for-you'}
          class="font-display font-bold text-3xl text-primary"
        >
          Cilantrify
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
              src={user() && user()!.picture ? user()!.picture : defaultAvatar}
            />
          </label>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a class="justify-between">
                Profile
                <span class="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            {user() && (
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
