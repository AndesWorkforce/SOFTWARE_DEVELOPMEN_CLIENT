"use client";
import Image from "next/image";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface HeaderProps {
  userAvatar?: string;
  userName?: string;
}

export const Header = ({ userAvatar, userName }: HeaderProps) => {
  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((n) => n.charAt(0).toUpperCase())
        .join("")
    : "U";

  return (
    <header
      className="fixed top-0 right-0 h-[55px] bg-white z-40 flex items-center justify-end pr-[31px] py-[10px]"
      style={{
        left: "0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          header {
            left: 237px !important;
          }
        }
      `}</style>
      <div className="flex items-center gap-[20px]">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Avatar */}
        {userAvatar ? (
          <Image
            src={userAvatar}
            alt={userName || "User"}
            width={35}
            height={35}
            className="w-[35px] h-[35px] rounded-full object-cover"
          />
        ) : (
          <div
            className="w-[35px] h-[35px] rounded-full flex items-center justify-center text-[14px] font-semibold text-white flex-shrink-0"
            style={{ backgroundColor: "#5e7a00" }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
};
