import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { GuestGuard } from 'src/auth/guard';

import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------



// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));

// ----------------------------------------------------------------------



const authJwt = {
  path: 'jwt',
  element: (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      index: true,
      element: (
        <AuthClassicLayout>
          <JwtLoginPage />
        </AuthClassicLayout>
      ),
    },
  ],
};



export const authRoutes = [
  {
    path: 'auth',
    children: [authJwt],
  },
];
