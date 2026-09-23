import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, loading, ...props }) => {
  return (
    <MuiButton variant="contained" fullWidth disabled={loading || props.disabled} type={props.type} onClick={props.onClick} sx={{ minHeight: 46, backgroundColor: '#263238', '&:hover': { backgroundColor: '#37474f' } }}>
      {loading ? <CircularProgress size={19} sx={{ color: '#fffaf0' }} /> : children}
    </MuiButton>
  );
};
