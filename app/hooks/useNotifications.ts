import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const useNotifications = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const showSuccess = (message: string, translationKey?: string) => {
    const translatedMessage = message || (translationKey ? t(translationKey) : "");
    enqueueSnackbar(translatedMessage, { 
      variant: 'success',
      preventDuplicate: true,
    });
  };

  const showError = (message: string, translationKey?: string) => {
    const translatedMessage = message || (translationKey ? t(translationKey) : t('notifications.error.network_error'));
    enqueueSnackbar(translatedMessage, { 
      variant: 'error',
      preventDuplicate: true,
    });
  };

  const showInfo = (message: string, translationKey?: string) => {
    const translatedMessage = message || (translationKey ? t(translationKey) : "");
    enqueueSnackbar(translatedMessage, { 
      variant: 'info',
      preventDuplicate: true,
    });
  };

  const showWarning = (message: string, translationKey?: string) => {
    const translatedMessage = message || (translationKey ? t(translationKey) : "");
    enqueueSnackbar(translatedMessage, { 
      variant: 'warning',
      preventDuplicate: true,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeSnackbar,
  };
}; 