import RecipePreview from '../components/RecipePreview';
import landingPageCooking from '/landing-page-cooking.svg';
import lentilMeatballsExample from '/lentil-meatballs-example.jpg';
import plusIcon from '/plus-icon.svg';
import shareIcon from '/share-icon.svg';
import followIcon from '/follow-user-icon.svg';
import Footer from '../components/Footer';
import { A } from '@solidjs/router';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div class="overflow-x-hidden w-screen">
      <Navbar
        isSearchBarVisible={true}
        isShouldRedirect={true}
      />
      <div class="hero min-h-screen bg-base-200">
        <div class="hero-content lg:p-0 py-32 flex-col lg:flex-row-reverse">
          <img
            src={landingPageCooking}
            class="max-w-sm "
          />
          <div class="lg:p-32 p-8">
            <h1 class="text-5xl font-bold ">
              There's are more social way to cook!
            </h1>
          </div>
        </div>
      </div>
      <div class="hero min-h-screen bg-base-300 ">
        <div class="hero-content lg:p-0 lg:py-20 py-16 gap-16 flex-col lg:flex-row ">
          <RecipePreview
            name="Nonna's Lentil Meatballs"
            image={lentilMeatballsExample}
            ingredients={[
              {
                name: 'Lentils',
                amount: 100,
                measurement: 'mg',
              },
            ]}
            instructions={['Cook lentils']}
          />
          <ul class="flex flex-col gap-10">
            <li class="flex flex-row justify-center gap-4">
              <h1 class="text-3xl font-bold ">Create Recipes</h1>
              <img
                class="w-10 fill-neutral-500"
                src={plusIcon}
              />
            </li>
            <li class="flex flex-row justify-center gap-4">
              <h1 class="text-3xl font-bold ">Share Them</h1>
              <img
                class="w-10"
                src={shareIcon}
              />
            </li>
            <li class="flex flex-row justify-center gap-4">
              <h1 class="text-3xl font-bold ">Follow Creators</h1>
              <img
                class="w-10 fill-base-100"
                src={followIcon}
              />
            </li>
          </ul>
        </div>
      </div>
      <div class="flex flex-col justify-center items-center p-32 bg-base-200">
        <A
          class="btn btn-primary btn-lg font-bold text-2xl"
          href="/auth/options"
        >
          Try It!
        </A>
      </div>
      <Footer />
    </div>
  );
}
