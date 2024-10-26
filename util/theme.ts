'use client';

import { createTheme } from '@mui/material/styles';
import { Kanit } from 'next/font/google';

const kanit = Kanit({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap'
});

export const theme = createTheme({
  palette: {
    mode: 'dark'
  },
  typography: {
    fontFamily: kanit.style.fontFamily,
    allVariants: { color: '#fff' }
  },
  components: {
    MuiButton: {
      defaultProps: {
        sx: {
          height: 30
        },
        size: 'large'
      }
    },
    MuiSelect: {
      defaultProps: {
        sx: {
          height: '40px'
        }
      }
    }
  }
});
