"use client";

import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCheck,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrentUser, useAllUsers, useUserActions } from "../../lib/hooks/useUsers";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export function UserSelector() {
  const { user } = useCurrentUser();
  const { users } = useAllUsers();
  const { switchUser, updateUserName } = useUserActions();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  if (!user) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  const displayName = (userName?: string | null, cookieId?: string) => {
    if (userName) return userName;
    return `User ${cookieId?.slice(0, 8) || "Unknown"}`;
  };

  const handleSwitchUser = async (userId: string) => {
    await switchUser(userId);
    // Refresh page data
    window.location.reload();
  };

  const handleUpdateName = async () => {
    if (newName.trim()) {
      await updateUserName(newName.trim());
      setIsEditingName(false);
      setNewName("");
    }
  };

  return (
    <div className="relative">
      <Listbox value={user.id} onChange={handleSwitchUser}>
        <div className="relative">
          <Listbox.Button className="relative w-48 cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
            <span className="block truncate">
              {displayName(user.name, user.cookie_id)}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FontAwesomeIcon
                icon={faChevronDown}
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-1 max-h-60 w-64 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {users.map((u) => (
                <Listbox.Option
                  key={u.id}
                  value={u.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex justify-between items-center">
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {displayName(u.name, u.cookie_id)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {u.project_count} projects
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}

              <div className="border-t border-gray-200 mt-1 pt-1">
                {!isEditingName ? (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
                    Edit display name
                  </button>
                ) : (
                  <div className="px-4 py-2">
                    <Input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name"
                      className="mb-2"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateName();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateName}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

