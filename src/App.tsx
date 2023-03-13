import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { QueryClientProvider } from "@tanstack/react-query";
import { Admin } from "./pages/admin/Admin";
import { Main } from "./pages/Main";
import { query } from "./utils/query";
import { Edit } from "./pages/Edit/Edit";

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={query}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route index path="/" element={<Main />} />
            <Route path="admin" element={<Admin />}></Route>
            <Route path="edit" element={<Edit />}></Route>
          </Routes>
        </ErrorBoundary>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
