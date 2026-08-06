import { toast } from "react-toastify";
import { createElement } from "react";
import { KalaiToast } from "@/shared/components/ui/KalaiToast";

export type ToastVariant = "default" | "success" | "error";

export interface ToastPayload {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function pushToast({ title, description, variant }: ToastPayload) {
  const content = ({ closeToast }: { closeToast?: () => void }) =>
    createElement(KalaiToast, { title, description, closeToast });

  switch (variant) {
    case "error":
      toast.error(content, { icon: false });
      break;
    case "success":
      toast.success(content, { icon: false });
      break;
    default:
      toast(content, { icon: false });
  }
}
