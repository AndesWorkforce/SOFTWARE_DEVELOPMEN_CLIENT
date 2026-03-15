"use client";
import { ChevronDown } from "lucide-react";

export const AgentSelector = () => {
  return (
    <div>
      <div
        className="flex items-center justify-between px-[15px] py-[10px] rounded-[5px]"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(166, 166, 166, 0.5)",
          height: "45px",
        }}
      >
        <span
          className="text-[16px] font-normal"
          style={{ color: "#1E1E1E", fontFamily: "Inter, sans-serif" }}
        >
          Agent VM-Dev-01
        </span>
        <ChevronDown className="w-6 h-6" style={{ color: "#000000" }} />
      </div>
    </div>
  );
};
