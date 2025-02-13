import { toast } from 'sonner';
import confetti from 'canvas-confetti';

//can import showSuccessToast and showErrorToast for use ANYWHERE :D
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'bottom-center',
    duration: 2000,
    style: {
      background: '#22c55e',
      color: 'white',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '16px',
      display: 'flex',
      width: 'auto',
      minWidth: 'fit-content',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '8px',
    },
    onAutoClose: () => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.9 }, // Confetti shoots from the bottom
      });
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    position: 'bottom-center',
    style: {
      background: '#ef4444',
      color: 'white',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'auto',
      minWidth: 'fit-content',
      textAlign: 'center',
      gap: '8px',
    },
  });
};
