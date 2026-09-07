import { Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout"

import { patientRoutes } from "@/app/routes.patient";
import { publicRoutes } from "@common/public/routes.public.jsx";

export default function AppRouter() {
  return (
    <Routes >
      <Route element={<AppLayout />}>
        {publicRoutes.map(r => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}

        {patientRoutes.map(r => (
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