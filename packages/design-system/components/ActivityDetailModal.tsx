"use client";
import { Modal } from "./Modal";
import type { UserActivity } from "@/packages/types/reports.types";
import type { ContractorSession } from "@/packages/types/adt.types";
import { X } from "lucide-react";
import { ActivityUserHeader } from "./ActivityUserHeader";
import { ActivityDetailHeader } from "./ActivityDetailHeader";
import { AgentSelector } from "./AgentSelector";
import { TimeBreakdown } from "./TimeBreakdown";
import { InputTotals } from "./InputTotals";
import { SessionConnectivity } from "./SessionConnectivity";
import { TopApplications } from "./TopApplications";

export interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: UserActivity | null;
  t: (key: string) => string;
  dateRange?: { from: string; to: string };
  sessions?: ContractorSession[];
  isLoading?: boolean;
}

// Skeleton component for loading state
const SkeletonBox = ({
  width,
  height,
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) => (
  <div
    className={`animate-pulse rounded ${className}`}
    style={{
      width: width || "100%",
      height: height || "20px",
      background: "#e5e5e5",
    }}
  />
);

// Skeleton for the entire modal content
const ActivityDetailSkeleton = ({
  t,
  onClose,
}: {
  t: (key: string) => string;
  onClose: () => void;
}) => (
  <>
    {/* Header with Close Button */}
    <div
      className="flex items-center justify-end shrink-0 mb-0"
      style={{ width: "24px", height: "24px", marginLeft: "auto" }}
    >
      <button
        onClick={onClose}
        className="p-0 hover:opacity-70 transition-opacity cursor-pointer block"
        aria-label="Close modal"
        style={{ width: "24px", height: "24px" }}
      >
        <X className="w-6 h-6" style={{ color: "#000000" }} />
      </button>
    </div>

    <div className="flex flex-col gap-[25px] items-start" style={{ width: "100%" }}>
      {/* User Info Section Skeleton */}
      <div className="flex gap-[10px] items-center">
        <SkeletonBox width="45px" height="45px" className="rounded-full" />
        <div className="flex flex-col gap-[6px]">
          <SkeletonBox width="180px" height="24px" />
          <SkeletonBox width="220px" height="18px" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ background: "#E5E5E5" }} />

      {/* Activity Detail Header Skeleton */}
      <div className="flex flex-col gap-[6px]">
        <SkeletonBox width="150px" height="24px" />
        <SkeletonBox width="200px" height="16px" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="flex gap-[1.64%] items-start justify-between w-full" style={{ gap: "1.64%" }}>
        {/* Left Column */}
        <div className="flex flex-col gap-[10px]" style={{ width: "65.57%", minWidth: "400px" }}>
          {/* Agent Dropdown Skeleton */}
          <SkeletonBox height="45px" className="rounded-[5px]" />

          {/* Time Breakdown Skeleton */}
          <div
            className="px-[20px] py-[28px] rounded-[5px]"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(166, 166, 166, 0.5)",
              height: "132px",
            }}
          >
            <div className="flex flex-col gap-[15px]">
              <SkeletonBox width="130px" height="20px" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-[5px]">
                  <SkeletonBox width="80px" height="28px" />
                  <SkeletonBox width="60px" height="14px" />
                </div>
                <div className="flex flex-col items-center gap-[5px]">
                  <SkeletonBox width="90px" height="28px" />
                  <SkeletonBox width="70px" height="14px" />
                </div>
                <div className="flex flex-col items-center gap-[5px]">
                  <SkeletonBox width="90px" height="28px" />
                  <SkeletonBox width="80px" height="14px" />
                </div>
              </div>
            </div>
          </div>

          {/* Session & Connectivity Skeleton */}
          <div
            className="px-[20px] py-[28px] rounded-[5px]"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(166, 166, 166, 0.5)",
              height: "295px",
            }}
          >
            <div className="flex flex-col gap-[25px]">
              <div className="flex flex-col gap-[10px]">
                <SkeletonBox width="180px" height="20px" />
                <div className="flex gap-[10px]">
                  <div
                    className="flex-1 p-[10px] rounded-[5px]"
                    style={{ border: "1px solid rgba(166, 166, 166, 0.25)", height: "63px" }}
                  >
                    <SkeletonBox width="100px" height="14px" className="mb-[5px]" />
                    <SkeletonBox width="60px" height="24px" />
                  </div>
                  <div
                    className="flex-1 p-[10px] rounded-[5px]"
                    style={{ border: "1px solid rgba(166, 166, 166, 0.25)", height: "63px" }}
                  >
                    <SkeletonBox width="90px" height="14px" className="mb-[5px]" />
                    <SkeletonBox width="70px" height="24px" />
                  </div>
                </div>
              </div>
              <SkeletonBox height="122px" className="rounded-[5px]" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[10px]" style={{ width: "32.79%", minWidth: "200px" }}>
          {/* Input Totals Skeleton */}
          <div
            className="px-[17px] py-[28px] rounded-[5px]"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(166, 166, 166, 0.5)",
              height: "221px",
            }}
          >
            <div className="flex flex-col gap-[10px]">
              <SkeletonBox width="100px" height="20px" />
              <div
                className="p-[10px] rounded-[5px]"
                style={{ border: "1px solid rgba(166, 166, 166, 0.25)", height: "63px" }}
              >
                <SkeletonBox width="130px" height="14px" className="mb-[5px]" />
                <SkeletonBox width="80px" height="24px" />
              </div>
              <div
                className="p-[10px] rounded-[5px]"
                style={{ border: "1px solid rgba(166, 166, 166, 0.25)", height: "63px" }}
              >
                <SkeletonBox width="120px" height="14px" className="mb-[5px]" />
                <SkeletonBox width="70px" height="24px" />
              </div>
            </div>
          </div>

          {/* Top Applications Skeleton */}
          <div
            className="px-[17px] py-[28px] rounded-[5px]"
            style={{ background: "#FFFFFF", border: "1px solid rgba(166, 166, 166, 0.5)" }}
          >
            <div className="flex flex-col gap-[15px]">
              <SkeletonBox width="130px" height="20px" />
              <div className="flex flex-col gap-[10px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex gap-[10px] items-center">
                      <SkeletonBox width="15px" height="15px" className="rounded" />
                      <SkeletonBox width="60px" height="14px" />
                    </div>
                    <SkeletonBox width="50px" height="14px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export const ActivityDetailModal = ({
  isOpen,
  onClose,
  activity,
  t,
  dateRange,
  sessions = [],
  isLoading = false,
}: ActivityDetailModalProps) => {
  // Show skeleton when loading or when no activity data yet
  const showSkeleton = isLoading || !activity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showHeader={false}
      containerStyle={{
        background: "#F7F7F7",
        padding: "0",
        maxWidth: "42.36%", // 610px / 1440px = 42.36%
        width: "42.36%",
        minWidth: "610px", // Mantener mínimo para evitar que se haga muy pequeño
      }}
      contentStyle={{
        padding: "20px 25px",
        background: "#F7F7F7",
        borderRadius: "10px",
      }}
    >
      {showSkeleton ? (
        <ActivityDetailSkeleton t={t} onClose={onClose} />
      ) : activity ? (
        <>
          {/* Header with Close Button */}
          <div
            className="flex items-center justify-end shrink-0 mb-0"
            style={{ width: "24px", height: "24px", marginLeft: "auto" }}
          >
            <button
              onClick={onClose}
              className="p-0 hover:opacity-70 transition-opacity cursor-pointer block"
              aria-label="Close modal"
              style={{ width: "24px", height: "24px" }}
            >
              <X className="w-6 h-6" style={{ color: "#000000" }} />
            </button>
          </div>

          <div className="flex flex-col gap-[25px] items-start" style={{ width: "100%" }}>
            {/* User Info Section */}
            <ActivityUserHeader activity={activity} />

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{
                background: "#E5E5E5",
              }}
            />

            {/* Activity Detail Header */}
            <ActivityDetailHeader activity={activity} dateRange={dateRange} t={t} />

            {/* Main Content Grid */}
            <div
              className="flex gap-[1.64%] items-start justify-between w-full"
              style={{ gap: "1.64%" }}
            >
              {/* Left Column */}
              <div
                className="flex flex-col gap-[10px]"
                style={{ width: "65.57%", minWidth: "400px" }}
              >
                {/* Agent Dropdown */}
                <AgentSelector />

                {/* Time Breakdown */}
                <TimeBreakdown activity={activity} t={t} />

                {/* Session & Connectivity */}
                <SessionConnectivity sessions={sessions} t={t} />
              </div>

              {/* Right Column */}
              <div
                className="flex flex-col gap-[10px]"
                style={{ width: "32.79%", minWidth: "200px" }}
              >
                {/* Input Totals */}
                <InputTotals activity={activity} t={t} />

                {/* Top Applications */}
                <TopApplications activity={activity} t={t} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Modal>
  );
};
