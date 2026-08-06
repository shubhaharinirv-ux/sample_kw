export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  console.log("[Clipboard] Attempting to copy:", text.substring(0, 50) + "...");
  console.log("[Clipboard] isSecureContext:", window.isSecureContext);
  console.log("[Clipboard] navigator.clipboard exists:", !!navigator.clipboard);

  // 1. Try modern Clipboard API (requires HTTPS or localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("[Clipboard] Modern API succeeded");
      return true;
    } catch (err) {
      console.warn("[Clipboard] Modern API failed:", err);
    }
  }

  // 2. Try clipboard API without secure context check (some browsers allow it)
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("[Clipboard] Clipboard API (non-secure) succeeded");
      return true;
    } catch (err) {
      console.warn("[Clipboard] Clipboard API (non-secure) failed:", err);
    }
  }

  // 3. Fallback: execCommand - append to focused element's container or dialog
  console.log("[Clipboard] Trying execCommand fallback...");
  return execCommandCopy(text);
}

function execCommandCopy(text: string): boolean {
  // Find the best container - prefer inside any open dialog/modal
  const dialog = document.querySelector('[role="dialog"]');
  const container = dialog || document.body;

  console.log("[Clipboard] Using container:", container.tagName, dialog ? "(dialog found)" : "(body)");

  // Create textarea
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");

  // Style to be invisible but selectable
  Object.assign(textarea.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    opacity: "0",
    pointerEvents: "none",
  });

  container.appendChild(textarea);

  let success = false;

  try {
    // Focus and select the text
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    console.log("[Clipboard] Selection length:", textarea.selectionEnd - textarea.selectionStart);
    console.log("[Clipboard] Active element after focus:", document.activeElement?.tagName);

    // Execute copy
    success = document.execCommand("copy");
    console.log("[Clipboard] execCommand returned:", success);

  } catch (err) {
    console.error("[Clipboard] execCommand failed:", err);
    success = false;
  } finally {
    container.removeChild(textarea);
  }

  // If execCommand claims success but we're in a dialog, it might have failed silently
  // Show a manual copy fallback
  if (success) {
    console.log("[Clipboard] execCommand reported success - verify by pasting");
  }

  return success;
}
