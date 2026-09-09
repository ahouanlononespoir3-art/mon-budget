import { BrowserRouter } from "react-router-dom";

import { BudgetProvider } from "./context/BudgetContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
        <AppRoutes />
      </BudgetProvider>
    </BrowserRouter>
  );
}

export default App;