import { useToast } from '../context/ToastContext';

export const useClipboard = () => {
  const { showToast } = useToast();

  const copyToClipboard = (text, buttonName) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(`${buttonName} copied to clipboard!`, 'success');
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showToast("Failed to copy to clipboard", 'error');
      });
  };

  const pasteFromClipboard = async (setFunction) => {
    try {
      const text = await navigator.clipboard.readText();
      setFunction(text);
      showToast("Content pasted from clipboard", 'success');
    } catch (err) {
      console.error("Failed to paste: ", err);
      showToast("Failed to paste from clipboard", 'error');
    }
  };

  return { copyToClipboard, pasteFromClipboard };
};
