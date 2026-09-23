import React from 'react';
import { TextField } from '@mui/material';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'color' | 'size'> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <TextField id={id} label={label} fullWidth margin="dense" {...props} size="small" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fffdf8' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d97706' } }} />
  );
};
