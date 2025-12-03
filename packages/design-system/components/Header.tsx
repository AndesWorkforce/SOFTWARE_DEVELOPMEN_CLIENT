"use client";
import { Bell } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface HeaderProps {
  userAvatar?: string;
  userName?: string;
}

export const Header = ({ userAvatar, userName }: HeaderProps) => {
  return (
    <header
      className="fixed top-0 right-0 h-[55px] bg-white z-40 flex items-center justify-end px-4 md:px-8"
      style={{
        left: "0",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          header {
            left: 237px !important;
          }
        }
      `}</style>
      <div className="flex items-center gap-3 md:gap-6">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notification Bell */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" style={{ color: "#000000" }} />
        </button>

        {/* User Avatar */}
        <div className="relative w-6 h-6">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || "User"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: "#0097B2" }}
            >
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
