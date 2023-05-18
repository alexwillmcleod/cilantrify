import Profile from '../assets/profile.svg';

export default function Navbar() {
  return (
    <div className="flex flex-row p-10 justify-between sticky items-center">
      <span>
        <h1 className="font-bold font-display text-accent-green text-2xl sm:text-5xl">
          Cilantrify
        </h1>
      </span>
      <span>
        <img
          className="w-12 sm:w-24"
          src={Profile}
        ></img>
      </span>
    </div>
  );
}
