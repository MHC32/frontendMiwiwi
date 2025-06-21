import { m } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { varHover } from 'src/components/animate';
import { logout, selectCurrentUser, selectProfile } from 'src/redux/slices/auth.slice';
import type { AppDispatch } from 'src/redux/store';
// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Accueil',
    linkTo: '/',
  },
  {
    label: 'Settings',
    linkTo: paths.dashboard.user.account,
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();
 const currentUser = useSelector(selectCurrentUser);
 const profile = useSelector(selectProfile);
  console.log('men profile', profile)
  const user = {
    photoURL: '/assets/images/avatar_default.jpg',
    displayName: profile 
      ? `${profile.firstName} ${profile.lastName}` 
      : 'Utilisateur Invité',
    email: profile?.email || 'non-renseigné',
    role: currentUser?.role || 'guest'
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      enqueueSnackbar('Logout successful', { variant: 'success' });
      popover.onClose();
      router.replace('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      enqueueSnackbar(
        error.message || 'Unable to logout. Please try again.',
        { variant: 'error' }
      );
    }
  };

  const handleClickItem = (path: string) => {
    popover.onClose();
    router.push(path);
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={user.photoURL}
          alt={user.displayName}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user.displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem 
              key={option.label} 
              onClick={() => handleClickItem(option.linkTo)}
              sx={{ typography: 'body2' }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ 
            m: 1, 
            fontWeight: 'fontWeightBold', 
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
            }
          }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}

