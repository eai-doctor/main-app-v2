// Saebyeok - refactored at 032026

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "legacy-src/context/AuthContext";

import AppRouter from "legacy-src/app/AppRouter";

function App() {
  return (
    <Router>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
    </Router>
  );
} 

export default App;
