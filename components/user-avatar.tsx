import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
  src: string;
  alt?: string;
  className?: string;
}

export const UserAvatar = ({
  src,
  className,
  alt = "img",
}: UserAvatarProps) => {
  return (
    <Avatar className={cn("rounded-lg size-14", className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className={cn("rounded-lg", className)}>
        {alt}
      </AvatarFallback>
    </Avatar>
  );
};
