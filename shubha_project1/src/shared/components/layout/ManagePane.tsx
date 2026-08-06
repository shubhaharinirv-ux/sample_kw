import { ArrowLeft, Folder, Users, Grid, Upload } from "lucide-react";

interface ManagePaneProps {
  onBack: () => void;
  onSelectCategoryA: () => void;
  onSelectCategoryB: () => void;
  onSelectCategoryC: () => void;
  onSelectUpload: () => void;
  activeItem?: "categoryA" | "categoryB" | "categoryC" | "upload";
}

const items = [
  { id: "categoryA" as const, label: "Category A", icon: Folder },
  { id: "categoryB" as const, label: "Category B", icon: Grid },
  { id: "categoryC" as const, label: "Category C", icon: Users },
  { id: "upload" as const, label: "Upload", icon: Upload },
];

export default function ManagePane({
  onBack,
  onSelectCategoryA,
  onSelectCategoryB,
  onSelectCategoryC,
  onSelectUpload,
  activeItem,
}: ManagePaneProps) {
  const handlers = {
    categoryA: onSelectCategoryA,
    categoryB: onSelectCategoryB,
    categoryC: onSelectCategoryC,
    upload: onSelectUpload,
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to library
      </button>
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={handlers[id]}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
            activeItem === id
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
