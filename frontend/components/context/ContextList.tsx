"use client";

import { ContextItem } from "./ContextItem";
import { Spinner } from "../ui/Spinner";
import type { ContextItem as ContextItemType } from "../../lib/types/models";

export interface ContextListProps {
  items: ContextItemType[];
  isLoading?: boolean;
  onDelete: (id: string) => void;
}

export function ContextList({ items, isLoading, onDelete }: ContextListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No context items yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ContextItem key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}

