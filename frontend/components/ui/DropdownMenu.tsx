"use client";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from "@/components/ui/headless";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
}: DropdownMenuProps) {
  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        {trigger}
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg border border-slate-200 py-1 focus:outline-none",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, idx) => (
            <MenuItem key={idx} disabled={item.disabled}>
              {({ focus }: { focus: boolean }) => (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm font-medium transition-colors",
                    focus
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-700",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    item.className
                  )}
                >
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
