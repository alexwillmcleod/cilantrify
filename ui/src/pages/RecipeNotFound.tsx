import { A } from '@solidjs/router';
import NotFoundImage from '/not-found.svg';
import Navbar from '../components/Navbar';

export default function RecipeNotFound() {
  return (
    <div class="min-h-screen">
      <Navbar />
      <div class="hero h-full ">
        <div class="flex flex-col lg:flex-row hero-content text-center">
          <img
            class="w-96"
            src={NotFoundImage}
          />
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Recipe not found</h1>
            <p class="py-6">
              Hi there! This recipe is no longer available and may have been
              deleted by the creator.
            </p>
            <A
              href="/for-you"
              class="btn btn-primary"
            >
              Back
            </A>
          </div>
        </div>
      </div>
    </div>
  );
}
