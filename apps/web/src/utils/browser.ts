export const pasteFromClipboard = async (onSuccess: (value: string) => void) => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText) {
      onSuccess(clipboardText);
    }
  } catch (e) {
    console.error(e);
    // TODO: shown error toast when implemented
  }
};

export const shareOnTwitter = (text: string) => {
  window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, "_blank");
};
