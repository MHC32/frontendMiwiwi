// @mui
import { Theme, SxProps } from '@mui/material/styles';
import Button from '@mui/material/Button';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';



// ----------------------------------------------------------------------

const loginPaths = {
  jwt: paths.auth.jwt.login,
};

type Props = {
  sx?: SxProps<Theme>;
};

export default function LoginButton({ sx }: Props) {

  return (
    <Button 
      component={RouterLink} 
      href={loginPaths.jwt} 
      variant="outlined" 
      sx={{ mr: 1, ...sx }}
    >
      Login
    </Button>
  );
}