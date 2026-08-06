import React from "react";

interface KalaiToastProps {
  title: string;
  description?: string;
  closeToast?: () => void;
}

export function KalaiToast({ title, description, closeToast }: KalaiToastProps) {
  return (
    <div className="flex flex-col gap-0.5 pr-4">
      <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 leading-snug">{description}</p>
      )}
    </div>
  );
}
