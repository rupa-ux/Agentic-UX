import { useEffect, useRef, useState } from "react";
import { PostDetailsDrawerContent } from "./PostDetailsDrawerContent";
import { RightDrawer } from "./RightDrawer";

interface PostDetailsDrawerProps {
  postId: string | null;
  postIds?: string[];
  onClose: () => void;
}

export function PostDetailsDrawer({ postId, postIds = [], onClose }: PostDetailsDrawerProps) {
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

  const navigate = (direction: "prev" | "next") => {
    if (!renderedPostId || postIds.length === 0) return;
    const currentIndex = postIds.indexOf(renderedPostId);
    if (currentIndex === -1) return;
    const nextIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= postIds.length) return;
    setRenderedPostId(postIds[nextIndex]);
  };

  if (!renderedPostId) return null;

  const currentIndex = postIds.indexOf(renderedPostId);
  const hasIds = postIds.length > 0 && currentIndex !== -1;

  return (
    <RightDrawer onClose={handleClose} isOpen={isOpen}>
      <PostDetailsDrawerContent
        postId={renderedPostId}
        onClose={handleClose}
        postIndex={hasIds ? currentIndex + 1 : undefined}
        postTotal={hasIds ? postIds.length : undefined}
        hasPrev={hasIds && currentIndex > 0}
        hasNext={hasIds && currentIndex < postIds.length - 1}
        onPrev={() => navigate("prev")}
        onNext={() => navigate("next")}
      />
    </RightDrawer>
  );
}
