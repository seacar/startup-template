"use client";

import { UserSelector } from "./UserSelector";
import { useUIStore } from "../../stores/useUIStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            AI Document Generator
          </h1>
        </div>
        <UserSelector />
      </div>
    </header>
  );
}

