'use client';

import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function ActionModal({
  children,
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => unknown;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(isOpen);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  React.useEffect(() => setOpen(isOpen), [isOpen]);

  return (
    <Dialog
      maxWidth="sm"
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="dialog-title"
      sx={{
        '& .MuiDialog-paper': {
          width: theme.breakpoints.values.sm - 45,
          maxWidth: theme.breakpoints.values.sm - 45
        }
      }}
    >
      {children}
    </Dialog>
  );
}
