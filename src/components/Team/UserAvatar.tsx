
import { User } from "lucide-react";

interface UserAvatarProps {
  name: string;
}

export const UserAvatar = ({ name }: UserAvatarProps) => {
  return (
    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
      <User className="h-4 w-4" />
    </div>
  );
};
