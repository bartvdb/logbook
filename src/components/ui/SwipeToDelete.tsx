import React, { useRef, useState, useEffect } from 'react';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  children,
  onDelete,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const DELETE_THRESHOLD = 80;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleStart = (clientX: number, clientY: number) => {
      startX.current = clientX;
      startY.current = clientY;
      isHorizontal.current = null;
      setIsDragging(true);
    };

    const handleMove = (clientX: number, clientY: number, e: Event) => {
      if (!isDragging) return;

      const diffX = clientX - startX.current;
      const diffY = clientY - startY.current;

      // Determine direction on first movement
      if (isHorizontal.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
      }

      // Only handle horizontal swipes to the left
      if (isHorizontal.current === true && diffX < 0) {
        e.preventDefault();
        const maxSwipe = -120;
        setTranslateX(Math.max(diffX, maxSwipe));
      }
    };

    const handleEnd = () => {
      if (Math.abs(translateX) >= DELETE_THRESHOLD) {
        if (window.confirm('Delete this entry?')) {
          onDelete();
        }
      }
      setTranslateX(0);
      setIsDragging(false);
      isHorizontal.current = null;
    };

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isDragging, translateX, onDelete]);

  const deleteOpacity = Math.min(Math.abs(translateX) / DELETE_THRESHOLD, 1);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Delete background */}
      {translateX < -5 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-red-500"
          style={{
            width: Math.abs(translateX) + 20,
            opacity: deleteOpacity,
          }}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </div>
      )}

      {/* Swipeable content */}
      <div
        ref={elementRef}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative bg-white dark:bg-neutral-950"
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeToDelete;
