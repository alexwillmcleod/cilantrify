// interface RecipePreviewProps {

// }

export default function RecipePreview(props: any) {
  return (
    <div class="mockup-window border bg-base-200 border-base-300 p-5 mx-10 mb-36">
      <div class="flex flex-col justify-center items-center gap-6">
        <img
          class="h-64 w-10/12 rounded-xl object-cover "
          src={props.image}
        />
        <h2 class="font-bold text-3xl font-sans text-primary">{props.name}</h2>
        <div class="flex flex-col gap-3">
          <p class="font-bold text-xl font-sans">Ingredients</p>
          <ul class="flex flex-col gap-2">
            {props.ingredients.map((element: any) => (
              <li class="list-disc">
                <div class="flex flex-row gap-4">
                  {element.name}
                  <span class="italic">
                    {element.amount}
                    {element.measurement}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div class="flex flex-col gap-3">
          <p class="font-bold text-xl font-sans">Instructions</p>
          <ul class="flex flex-col gap-1">
            {props.instructions.map((element: any) => (
              <li class="list-decimal">{element}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
