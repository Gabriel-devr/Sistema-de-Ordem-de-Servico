"use client";

import { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
