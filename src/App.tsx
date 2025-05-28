import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { QueryClientProvider } from "@tanstack/react-query";
import { Admin } from "./pages/admin/Admin";
import { Main } from "./pages/Main";
import { query } from "./utils/query";
import { Edit } from "./pages/Edit/Edit";
import { ErrorBoundary } from "@sentry/react";

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={query}>
        <ErrorBoundary fallback={ErrorFallback}>
          <Routes>
            <Route index path="/" element={<Main />} />
            <Route path="admin" element={<Admin />}/>
            <Route path="edit" element={<Edit />}/>
          </Routes>
        </ErrorBoundary>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
