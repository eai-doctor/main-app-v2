import { Routes, Route } from "react-router-dom";
import AppLayout from "@/app/AppLayout"
import { RouteGuard } from "@/app/RouteGuard"

import { clinicianRoutes } from "@/app/routes.clinician";
import { publicRoutes } from "@/app/routes.public";
import { adminRoutes } from "@/app/routes.admin";
import { functionRoutes } from "@/app/routes.clinician.functions";


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