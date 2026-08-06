import React from "react";
import { Alert } from "@/shared/components/ui/alert";

interface ErrorAlertProps {
  message?: string;
  error?: string | null;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  error,
  className = "",
}) => {
  const errorText = error || message;

  if (!errorText) return null;

  return (
    <Alert className={`bg-red-50 border-red-200 text-red-800 ${className}`}>
      <p className="text-sm font-medium">{errorText}</p>
    </Alert>
  );
};
