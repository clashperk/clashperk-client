import { CategoriesEntity } from '@/lib/generated/graphql';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import * as React from 'react';

export default function CategoryMenu({
  onChange,
  isOpen,
  anchorEl,
  categories
}: {
  isOpen: boolean;
  anchorEl: HTMLElement | null;
  onChange: (category: CategoriesEntity) => unknown;
  categories: CategoriesEntity[];
}) {
  const [open, setOpen] = React.useState(isOpen);
  React.useEffect(() => setOpen(isOpen), [isOpen]);

  return (
    <Menu
      id="basic-menu"
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      MenuListProps={{
        'aria-labelledby': 'basic-button'
      }}
    >
      <MenuList>
        {categories.length ? (
          <>
            {categories.map((category, idx) => (
              <MenuItem
                key={idx}
                onClick={() => {
                  setOpen(false);
                  onChange(category as CategoriesEntity);
                }}
              >
                <ListItemIcon>{category.iconUrl}</ListItemIcon>
                <ListItemText>{category.label}</ListItemText>
              </MenuItem>
            ))}
          </>
        ) : (
          <MenuItem>
            <ListItemIcon>🔄</ListItemIcon>
            <ListItemText>Loading...</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
}
