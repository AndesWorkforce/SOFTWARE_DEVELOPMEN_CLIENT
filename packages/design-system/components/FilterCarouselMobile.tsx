"use client";

import { Children } from "react";

interface FilterCarouselMobileProps {
  children: React.ReactNode;
}

export function FilterCarouselMobile({ children }: FilterCarouselMobileProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div className="flex flex-wrap items-center justify-center w-full min-w-0 box-border overflow-hidden max-w-full gap-[5px]">
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="min-w-0 box-border w-[calc(50%-2.5px)] max-w-[calc(50%-2.5px)] shrink-0 overflow-hidden"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
