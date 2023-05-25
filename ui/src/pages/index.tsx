import CookingImage from '../assets/cooking.svg';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 p-20 max-sm:p-6">
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center gap-8">
          <p className="text-display font-bold text-3xl text-accent-blue w-96 max-sm:text-xl max-sm:w-fit">
            There's a better way to cook
          </p>
          <Link
            className="bg-accent-green px-4 py-2 w-fit rounded-xl font-bold text-white text-lg max-sm:text-sm"
            to="/sign-in"
          >
            Get Cooking!
          </Link>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center max-md:hidden">
        <img
          className="w-[20rem]"
          src={CookingImage}
        />
      </div>
    </div>
  );
}
