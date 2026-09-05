import {
    AdminRegister,
    AdminLogin,
    AdminDashboard
} from 'legacy-src/pages/admin';

import { AdminOnlyGuard } from "legacy-src/app/RouteGuard";


export const adminRoutes = [
  { path: "/admin/register", element: <AdminRegister /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <AdminOnlyGuard><AdminDashboard /></AdminOnlyGuard> },
];
