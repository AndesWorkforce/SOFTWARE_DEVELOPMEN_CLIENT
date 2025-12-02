"use client";
import { useState } from "react";
import type { UserActivity } from "@/packages/api/reports/reports.types";

export interface ActivityCardProps {
  activity: UserActivity;
  defaultExpanded?: boolean;
}

export const ActivityCard = ({ activity, defaultExpanded = false }: ActivityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getActivityColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getActivityBgColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-100";
    if (percentage >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">User: {activity.user.name}</p>
              <p className="text-sm text-gray-600">Job Position: {activity.jobPosition}</p>
            </div>
          </div>
        </div>
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

      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User:</span>
              <span className="text-sm font-medium text-gray-900">{activity.user.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Job Position:</span>
              <span className="text-sm font-medium text-gray-900">{activity.jobPosition}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Team:</span>
              <span className="text-sm font-medium text-gray-900">{activity.team.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Country:</span>
              <span className="text-sm font-medium text-gray-900">{activity.country}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm font-medium text-gray-900">{activity.timeWorked}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activity:</span>
              <span
                className={`text-sm font-bold px-2 py-1 rounded ${getActivityBgColor(activity.activityPercentage)} ${getActivityColor(activity.activityPercentage)}`}
              >
                {activity.activityPercentage}%
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 underline">
                Activity Detail: View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
