"use client";
import { CircleUserRound } from "lucide-react";
import type { UserActivity } from "@/packages/types/reports.types";

export interface ActivityUserHeaderProps {
  activity: UserActivity;
}

export const ActivityUserHeader = ({ activity }: ActivityUserHeaderProps) => {
  return (
    <div className="flex gap-[10px] items-center">
      <CircleUserRound className="w-[45px] h-[45px]" style={{ color: "#000000" }} />
      <div className="flex flex-col gap-[2px]">
        <h3
          className="text-[20px] font-semibold leading-normal"
          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
        >
          {activity.user.name}
        </h3>
        <p
          className="text-[16px] font-normal leading-normal"
          style={{ color: "#000000", fontFamily: "Inter, sans-serif" }}
        >
          {activity.jobPosition} | {activity.team.name}
        </p>
      </div>
    </div>
  );
};
