import React from "react";
import { InputAdornment, TextField } from "@mui/material";

interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "color" | "size"
  > {
  label: string;
  endAdornment?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  endAdornment,
  ...props
}) => {
  return (
    <TextField
      id={id}
      label={label}
      fullWidth
      margin="dense"
      size="small"
      {...props}
      slotProps={{
        input: {
          endAdornment: endAdornment ? (
            <InputAdornment position="end">
              {endAdornment}
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "#fffdf8",
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#d97706",
        },
      }}
    />
  );
};