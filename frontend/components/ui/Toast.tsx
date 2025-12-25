"use client";

import { Fragment, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function Toast({
  isOpen,
  onClose,
  message,
  type = "info",
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faCheckCircle,
  };

  const colors = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={clsx(
          "fixed bottom-4 right-4 max-w-sm w-full rounded-lg shadow-lg border p-4 z-50",
          colors[type]
        )}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon
              icon={icons[type]}
              className="h-5 w-5"
            />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}

