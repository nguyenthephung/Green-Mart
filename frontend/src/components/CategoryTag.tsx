import { Tag } from "lucide-react";
import { FC } from "react";

const CategoryTag: FC<{ name: string; active: boolean; onClick: () => void }> = ({ name, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${
        active ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
      }`}
    >
      <Tag size={14} /> {name}
    </button>
  );
};

export default CategoryTag;
