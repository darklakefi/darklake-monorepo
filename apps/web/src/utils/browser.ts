export const pasteFromClipboard = async (onSuccess: (value: string) => void) => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText) {
      onSuccess(clipboardText);
    }
  } catch (e) {
    // TODO: shown error toast when implemented
  }
};
