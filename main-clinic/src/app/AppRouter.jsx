import { Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout"
import { RouteGuard } from "./RouteGuard"

import { clinicianRoutes } from "./routes.clinician";
import { publicRoutes } from "./routes.public";
import { adminRoutes } from "legacy-src/app/routes.admin";
import { functionRoutes } from "./routes.clinician.functions";


export default function AppRouter() {
  return (
    <Routes >
      <Route element={<AppLayout />}>
        {publicRoutes.map(r => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
 
        {clinicianRoutes.map(r => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <RouteGuard roles={["clinician", "admin"]} requireConsent>
                {r.element}
              </RouteGuard>
            }
          />
        ))} 


        {functionRoutes.map(r => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <RouteGuard roles={["clinician", "admin"]} requireConsent>
                {r.element}
              </RouteGuard>
            }
          />
        ))}

        {adminRoutes.map(r => (
          <Route
            key={r.path}
            path={r.path}
            element={r.element}
          />
        ))}
      </Route>
    </Routes>
  );
}