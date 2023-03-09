import { ErrorBoundary } from "react-error-boundary";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { Admin } from "./pages/admin/Admin";
import { Main } from "./pages/Main";

function App() {
  return (
    <HashRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route index path="/" element={<Main />} />
          <Route path="admin" element={<Admin />}></Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;
