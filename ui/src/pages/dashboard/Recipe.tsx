import NotFoundImage from '../../assets/notfound.svg';
import { useNavigate } from 'react-router';

interface RecipeProps {
  id: number;
  key: number;
  title: string;
  description?: string;
  picture?: string;
  firstName: string;
  lastName: string;
}

export default function Recipe(props: RecipeProps) {
  const navigate = useNavigate();

  return (
    <button
      className="flex flex-col gap-2 p-6 shadow-lg rounded-xl max-w-xl m-0"
      onClick={() => navigate(`/recipe/${props.id}`)}
      key={props.key}
    >
      {props.picture ? (
        <img
          className="aspect-video object-cover rounded-md"
          src={props.picture}
        />
      ) : (
        <img
          className="aspect-video object-fit rounded-md"
          src={NotFoundImage}
        />
      )}
      <span className="flex flex-col ">
        <h2 className="font-bold text-left">{props.title}</h2>
        <p className="text-left">{props.description}</p>
        <p className="text-left">
          {props.firstName} {props.lastName}
        </p>
      </span>
    </button>
  );
}
