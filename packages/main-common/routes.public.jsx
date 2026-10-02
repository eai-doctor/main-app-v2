import Settings from "./public/settings/index.jsx";

import {
    ResetPasswordPage, 
    AboutUs,
    HelpCenter,
    LegalPage
} from './public'; 


export const publicRoutes = [
  { path: "/settings", element: <Settings /> },

  // { path: "/", element: <LandingPage /> },
  // { path: "/clinic-join", element: <ClinicJoin mode="scrolling" /> },
  // { path: "/privacy-policy", element: <PrivacyPolicy /> },
  // {
  //   path: "/demo-request",
  //   element: <DemoRequest />,
  // },
  { path: "/reset-password", element: <ResetPasswordPage  /> },
  { path: "/about-us", element: <AboutUs  /> },
  { path: "/help-center", element: <HelpCenter /> },
  { path: "/legal", element: <LegalPage /> },
];
