import { lazy } from 'react';
import { Navigate, useRoutes, Outlet } from 'react-router-dom';
// layouts
// import MainLayout from 'src/layouts/main';
// config
// import { PATH_AFTER_LOGIN } from 'src/config-global';


import { AuthSync } from 'src/auth/auth-sync';
import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';
import { JwtLoginView } from 'src/sections/auth/jwt';
import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

// 🆕 CATEGORY
const CategoryListPage = lazy(() => import('src/pages/dashboard/category/list'));

//  STORE
const ListStore = lazy(() => import('src/pages/dashboard/store/list'))
const EditStore = lazy(() => import('src/pages/dashboard/store/edit'))
const NewStore = lazy(() => import('src/pages/dashboard/store/create'))

// EMPLOYEE
const ListEmployee = lazy(() => import('src/pages/dashboard/employee/list'))
const EditEmployee = lazy(() => import('src/pages/dashboard/employee/edit'))
const NewEmployee = lazy(() => import('src/pages/dashboard/employee/create'))

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
// PRODUCT
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));

// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));

// USER
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));


// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
// ----------------------------------------------------------------------
export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard/app" replace />,
    },
    {
      path: 'auth',
      children: [
        {
          path: 'jwt',
          element: (
            <GuestGuard>
              <AuthClassicLayout>
                <Outlet />
              </AuthClassicLayout>
            </GuestGuard>
          ),
          children: [
            { path: 'login', element: <JwtLoginView /> }
          ]
        }
      ]
    },
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </AuthGuard>
      ),
      children: [
        { path: 'app', element: <IndexPage /> },
        {
          path: 'store',
          children: [
            { element: <ListStore />, index: true },
            { path: 'list', element: <ListStore /> },
            { path: 'edit/:id', element: <EditStore /> },
            { path: 'new', element: <NewStore /> }
          ],
        },

        {
          path: 'category',
          children: [
            { element: <CategoryListPage />, index: true },
            { path: 'list', element: <CategoryListPage /> },
          ],
        },

        {
          path: 'employee',
          children: [
            { element: <ListEmployee />, index: true },
            { path: 'list', element: <ListEmployee /> },
            { path: 'edit/:id', element: <EditEmployee /> },
            { path: 'new', element: <NewEmployee /> }
          ],
        },

        { path: 'file', element: <OverviewFilePage /> },
        { path: 'analytics', element: <OverviewAnalyticsPage /> },
        {
          path: 'user',
          children: [
            { path: 'list', element: <UserListPage /> },
            { path: 'new', element: <UserCreatePage /> },
            { path: ':id/edit', element: <UserEditPage /> },
            { path: 'account', element: <UserAccountPage /> },
          ],
        },
        {
          path: 'product',
          children: [
            { element: <ProductListPage />, index: true },
            { path: 'list', element: <ProductListPage /> },
          ],
        },
        {
          path: 'order',
          children: [
            { element: <OrderListPage />, index: true },
            { path: 'list', element: <OrderListPage /> },
            { path: ':id', element: <OrderDetailsPage /> },
          ],
        },
        {
          path: 'invoice',
          children: [
            { element: <InvoiceListPage />, index: true },
            { path: 'list', element: <InvoiceListPage /> }
          ],
        },
        { path: 'file-manager', element: <FileManagerPage /> },
        { path: 'chat', element: <ChatPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}

