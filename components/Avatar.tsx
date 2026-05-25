import React from "react";

type AvatarProps = {
  username: string;
  /** optional background colour – defaults to gray */
  bgColor?: string;
  /** additional CSS classes for size, margin, etc. */
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ username, bgColor, className = "" }) => {
  const letter = username?.[0]?.toUpperCase() ?? "?";
  const background = bgColor ?? "bg-gray-600";
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white ${background} ${className}`}
    >
      {letter}
    </div>
  );
};

export default Avatar;
