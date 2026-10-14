import { Database, ExternalLink } from "lucide-react";

import config from "@/config";

export default function MedplumShortcut() {
  if (!config.medplumAppUrl) return null;

  return (
    <a
      href={config.medplumAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Medplum UI in a new tab"
      title="Open Medplum UI"
      className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:bottom-5"
    >
      <Database className="h-4 w-4" aria-hidden="true" />
      <span>Medplum UI</span>
      <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </a>
  );
}
