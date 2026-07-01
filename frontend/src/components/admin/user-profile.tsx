import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

import { useAuth } from "@/src/hooks/useAuth";

export function UserProfile() {
  const { state } = useAuth();

  const user = state.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <span className="font-medium">
          {user.firstName} {user.lastName}
        </span>

        <span className="text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
      <Avatar>
        <AvatarImage src={user.profileImage} />
        <AvatarFallback>
          {`${user.fullName[0]}`}
        </AvatarFallback>
      </Avatar>


    </div>
  );
}