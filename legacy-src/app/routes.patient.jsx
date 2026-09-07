import {
  PersonalHome,
  MedicalProfile,
  HealthConsultation,
  MedicalReportAnalysis,
} from 'src/pages/patient';
import { TriageEngine } from 'src/pages/public/function';
import { PatientOnlyGuard } from "src/app/RouteGuard";

export const patientRoutes = [
  { path: "/", element: <PersonalHome /> },
  { path: "/signup", element: <PersonalHome /> },
  { path: "/health-consultation", element: <HealthConsultation /> },
  { path: "/medical-profile", element: <PatientOnlyGuard><MedicalProfile /></PatientOnlyGuard> },
  { path: "/triage-engine", element: <PatientOnlyGuard><TriageEngine /></PatientOnlyGuard> },
  { path: "/medical-report-analysis", element: <MedicalReportAnalysis /> },
];
