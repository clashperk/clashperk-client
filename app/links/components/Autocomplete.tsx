'use client';

import * as React from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';

import type { APIGuildMember, APIUser } from 'discord-api-types/v10';

const getUserAvatar = (user: APIUser) => {
  const avatarId =
    user.discriminator === '0'
      ? (Number(user.id) >> 22) % 6
      : Number(user.discriminator) % 5;
  if (!user.avatar)
    return `https://cdn.discordapp.com/embed/avatars/${avatarId}.png`;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
};

const getUsername = (user: APIUser) => {
  return user.discriminator === '0'
    ? `${user.global_name || user.username}`
    : `${user.username}#${user.discriminator}`;
};

const getNickName = (member: APIGuildMember) => {
  return member.nick || member.user.global_name || member.user.username;
};

export function AutocompleteSearch(props: {
  token: string;
  guildId: string;
  isPublicBot: boolean;
  onSelect: (user: APIUser) => unknown;
}) {
  const [value, setValue] = React.useState<APIGuildMember | null>(null);
  const [options, setOptions] = React.useState<APIGuildMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const debounceSearch = React.useMemo(
    () =>
      debounce(
        async (
          query: string,
          callback: (results: APIGuildMember[]) => unknown
        ) => {
          const members = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/guilds/${props.guildId}/members?q=${query}&isPublicBot=${props.isPublicBot}`,
            {
              headers: {
                Authorization: `Bearer ${props.token}`
              }
            }
          ).then((res) => res.json());
          callback(members);
          return members as APIGuildMember[];
        },
        500
      ),
    [] // eslint-disable-line
  );

  React.useEffect(() => {
    let active = true;
    if (!inputValue) {
      setOptions(value ? [value] : []);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceSearch(inputValue, (results) => {
      if (active) {
        let newOptions: APIGuildMember[] = [];
        if (value) newOptions = [value];
        if (results) newOptions = [...newOptions, ...results]; // eslint-disable-line
        setOptions(newOptions);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, debounceSearch]);

  return (
    <Autocomplete
      sx={{ pt: 1 }}
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
        if (newValue) props.onSelect(newValue.user!);
        setOptions(newValue ? [newValue, ...options] : options);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      loading={loading}
      noOptionsText={inputValue ? 'No results' : 'Start typing to search users'}
      loadingText="Loading..."
      filterOptions={(x) => x}
      includeInputInList
      filterSelectedOptions
      options={options}
      getOptionLabel={(option) => getUsername(option.user!)}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.user.username}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      style={{ width: '100%' }}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.user!.id}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={getUserAvatar(option.user)}
              alt={option.user.username}
              title={option.user.username}
            >
              {option.user.username[0]}
            </Avatar>
            <Typography>
              <span style={{ marginRight: 3, padding: 0 }}>
                {getNickName(option)}
              </span>
              <br />
              <span style={{ marginRight: 3, fontSize: '12px', padding: 0 }}>
                {getUsername(option.user!)}
              </span>
            </Typography>
          </Stack>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="USER"
          autoFocus
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );
}
