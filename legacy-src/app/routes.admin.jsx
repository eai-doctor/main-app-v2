import {
    AdminRegister,
    AdminLogin,
    AdminDashboard
} from 'src/pages/admin';

import { AdminOnlyGuard } from "src/app/RouteGuard";


export const adminRoutes = [
  { path: "/admin/register", element: <AdminRegister /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <AdminOnlyGuard><AdminDashboard /></AdminOnlyGuard> },
];
