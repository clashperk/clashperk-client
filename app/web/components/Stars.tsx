import StarIcon from '@mui/icons-material/Star';
import * as React from 'react';

export const STARS: Record<string, React.ReactNode> = {
  NEW: <StarIcon sx={{ color: '#faaf00', width: 14, height: 14 }} />,
  OLD: (
    <StarIcon sx={{ color: 'rgb(207 142 18 / 70%)', width: 14, height: 14 }} />
  ),
  EMPTY: (
    <StarIcon sx={{ color: '#dcddde', width: 14, height: 14, opacity: 0.59 }} />
  )
};

export const WAR_STARS = {
  OLD: 'OLD-',
  NEW: 'NEW-',
  EMPTY: 'EMPTY-'
};

export function getStars(oldStars: number, newStars: number) {
  if (oldStars > newStars) {
    return [
      WAR_STARS.OLD.repeat(newStars),
      WAR_STARS.EMPTY.repeat(3 - newStars)
    ]
      .join('')
      .split('-')
      .filter((_) => _.length)
      .map((star, i) => (
        <React.Fragment key={i}>
          {STARS[star as keyof typeof STARS]}
        </React.Fragment>
      ));
  }
  return [
    WAR_STARS.OLD.repeat(oldStars),
    WAR_STARS.NEW.repeat(newStars - oldStars),
    WAR_STARS.EMPTY.repeat(3 - newStars)
  ]
    .join('')
    .split('-')
    .filter((_) => _.length)
    .map((star, i) => (
      <React.Fragment key={i}>
        {STARS[star as keyof typeof STARS]}
      </React.Fragment>
    ));
}
