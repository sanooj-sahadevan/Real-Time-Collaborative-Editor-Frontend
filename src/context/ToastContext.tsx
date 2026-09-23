import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const initialToast = (): ToastState => {
  const pendingToast = sessionStorage.getItem('papertrail-toast');
  if (!pendingToast) return { open: false, message: '', severity: 'info' };
  sessionStorage.removeItem('papertrail-toast');
  try {
    const saved = JSON.parse(pendingToast) as Omit<ToastState, 'open'>;
    return { ...saved, open: true };
  } catch {
    return { open: false, message: '', severity: 'info' };
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>(initialToast);
  const value = useMemo(() => ({
    showToast: (message: string, severity: ToastSeverity = 'info') => setToast({ open: true, message, severity }),
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3600}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{
            minWidth: 280,
            borderRadius: 2,
            bgcolor: toast.severity === 'success' ? '#4d7f59' : undefined,
            '& .MuiAlert-message': { fontWeight: 600 },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
