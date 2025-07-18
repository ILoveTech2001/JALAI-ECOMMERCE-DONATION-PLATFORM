import { Star } from "lucide-react"; // or use any star icon

const ReviewCard = ({ name, image, review, stars = 5 }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-64">
    <img
      src={image}
      alt={name}
      className="w-20 h-20 rounded-full object-cover border-4 border-green-500 mb-3"
    />
    <div className="flex mb-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={20}
          className={
            i < stars
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
          fill={i < stars ? "currentColor" : "none"}
        />
      ))}
    </div>
    <h4 className="font-semibold mb-1">{name}</h4>
    <p className="text-gray-600 text-sm text-center">{review}</p>
  </div>
);

export default ReviewCard;
