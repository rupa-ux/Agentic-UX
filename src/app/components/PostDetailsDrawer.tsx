import { useEffect, useRef, useState } from "react";
import { PostDetailsDrawerContent } from "./PostDetailsDrawerContent";
import { RightDrawer } from "./RightDrawer";

interface PostDetailsDrawerProps {
  postId: string | null;
  onClose: () => void;
}

export function PostDetailsDrawer({ postId, onClose }: PostDetailsDrawerProps) {
  // Keep the last non-null postId so content stays mounted during close animation
  const [renderedPostId, setRenderedPostId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (postId) {
      clearTimers();
      setRenderedPostId(postId);
      // Double rAF ensures the element is in the DOM before the transition fires
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsOpen(true))
      );
      return () => cancelAnimationFrame(raf);
    } else {
      // postId set to null externally — slide out then unmount
      setIsOpen(false);
      const t = setTimeout(() => setRenderedPostId(null), 1550);
      timersRef.current.push(t);
    }

    return clearTimers;
  }, [postId]);

  const handleClose = () => {
    setIsOpen(false);
    const t = setTimeout(() => {
      setRenderedPostId(null);
      onClose();
    }, 1550);
    timersRef.current.push(t);
  };

  if (!renderedPostId) return null;

  return (
    <RightDrawer onClose={handleClose} isOpen={isOpen}>
      <PostDetailsDrawerContent postId={renderedPostId} onClose={handleClose} />
    </RightDrawer>
  );
}
