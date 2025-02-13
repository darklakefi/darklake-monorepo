import { toast } from 'sonner';

export const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'bottom-center',
    style: {
      background: '#22c55e',
      color: 'white',
      borderRadius: '8px',
      padding: '16px 16px',
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
