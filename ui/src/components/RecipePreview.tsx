// interface RecipePreviewProps {

// }

export default function RecipePreview(props: any) {
  return (
    <div class="mockup-window border bg-base-200 border-base-300 py-12 px-8 overflow-x-hidden md:px-16 md:py-16 mx-0 mb-36 md:mx-10">
      <div class="flex flex-col gap-10">
        <img
          class="h-64 w-full rounded-xl object-cover "
          src={props.image}
        />
        <h2 class="font-bold text-3xl font-sans text-primary truncated text-justify">
          {props.name}
        </h2>
        <div class="flex flex-col gap-3 ">
          <p class="font-bold text-2xl font-sans">Ingredients</p>
          <ul class="flex flex-col gap-2">
            {props.ingredients.map((element: any) => (
              <li class="list-disc">
                <div class="flex flex-row gap-4 text-xl leading-8">
                  {element.name}
                  <span class="italic">
                    {element.amount}
                    {element.measurement == 'Units' ? '' : element.measurement}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div class="flex flex-col gap-3 ">
          <p class="font-bold text-2xl font-sans">Instructions</p>
          <ul class="flex flex-col gap-1">
            {props.instructions.map((element: any) => (
              <li class="list-decimal text-xl text-justify leading-8">
                {element}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
