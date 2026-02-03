"use client";

import { Children } from "react";

interface FilterCarouselMobileProps {
  children: React.ReactNode;
}

export function FilterCarouselMobile({ children }: FilterCarouselMobileProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div
      className="flex flex-wrap items-center justify-center w-full min-w-0"
      style={{
        boxSizing: "border-box",
        overflow: "hidden",
        maxWidth: "100%",
        gap: "5px",
      }}
    >
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="min-w-0"
          style={{
            boxSizing: "border-box",
            width: "calc(50% - 2.5px)",
            maxWidth: "calc(50% - 2.5px)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
