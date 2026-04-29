import { ActivityDrawerContent } from "./ActivityDrawerContent";
import { RightDrawer } from "./RightDrawer";

interface ActivityDrawerProps {
  postId: string | null;
  onClose: () => void;
}

export function ActivityDrawer({ postId, onClose }: ActivityDrawerProps) {
  if (!postId) return null;

  return (
    <RightDrawer onClose={onClose}>
        <ActivityDrawerContent postId={postId} onClose={onClose} />
    </RightDrawer>
  );
}
