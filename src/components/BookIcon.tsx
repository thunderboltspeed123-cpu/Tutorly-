import React from 'react';

interface BookIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  withGoldBookmark?: boolean;
}

export function BookIcon({
  className = '',
  size = 'md',
  animated = false,
  withGoldBookmark = true,
}: BookIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7 sm:w-8 sm:h-8',
  }[size];

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses} ${animated ? 'animate-gentle-bounce' : ''} ${className}`}
      aria-hidden="true"
    >
      {/* Left Page Leaf with Soft Tint */}
      <path
        d="M13.5 6.5C10 5.2 5.5 5.5 3 6.8V21.5C5.5 20.2 10 19.9 13.5 21.2V6.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Page Leaf with Soft Tint */}
      <path
        d="M14.5 6.5C18 5.2 22.5 5.5 25 6.8V21.5C22.5 20.2 18 19.9 14.5 21.2V6.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Book Spine Divider */}
      <path
        d="M14 6V21.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Left Page Contour Lines */}
      <path
        d="M6.5 10.5C8.5 9.8 10.5 9.8 11.5 10.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 14C8.5 13.3 10.5 13.3 11.5 13.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Right Page Contour Lines */}
      <path
        d="M16.5 10.2C17.5 9.8 19.5 9.8 21.5 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 13.7C17.5 13.3 19.5 13.3 21.5 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Little Gold Bookmark Ribbon hanging from the spine */}
      {withGoldBookmark && (
        <path
          d="M13.2 6V11.2L14 10.4L14.8 11.2V6H13.2Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="0.6"
        />
      )}
    </svg>
  );
}
