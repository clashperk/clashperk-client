import EventIcon from '@mui/icons-material/Event';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection,
  UseDateFieldProps
} from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { Dispatch, SetStateAction } from 'react';

interface ButtonFieldProps
  extends UseDateFieldProps<Dayjs, false>,
    BaseSingleInputFieldProps<
      Dayjs | null,
      Dayjs,
      FieldSection,
      false,
      DateValidationError
    > {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function CalenderOpener(props: ButtonFieldProps) {
  const {
    setOpen,
    value,
    id,
    disabled,
    InputProps: { ref } = {},
    inputProps: { 'aria-label': ariaLabel } = {}
  } = props;

  return (
    <IconButton
      id={id}
      ref={ref}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => setOpen((open) => !open)}
      disableRipple
    >
      <Stack
        direction="row"
        spacing={1}
        alignContent="center"
        alignItems="center"
      >
        <EventIcon sx={{ width: 30, height: 30, color: 'GrayText' }} />
        {value && (
          <Typography color="text.primary">
            {value.format('ddd, DD MMM, YYYY')}
          </Typography>
        )}
      </Stack>
    </IconButton>
  );
}
