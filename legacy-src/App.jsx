// Saebyeok - refactored at 032026

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "src/context/AuthContext";

import AppRouter from "src/app/AppRouter";

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
