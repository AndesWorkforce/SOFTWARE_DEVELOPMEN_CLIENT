"use client";
import { useState, ReactNode } from "react";

export interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

export const AccordionItem = ({
  title,
  children,
  defaultExpanded = false,
  onToggle,
  className = "",
}: AccordionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">{title}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      {isExpanded && <div className="p-4 bg-gray-50 border-t border-gray-200">{children}</div>}
    </div>
  );
};

export interface AccordionProps {
  children: ReactNode;
  className?: string;
  allowMultiple?: boolean;
}

export const Accordion = ({ children, className = "" }: AccordionProps) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};
