import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "./store/useStore";
import Layout from "./components/Layout";
import AuthScreen from "./pages/AuthScreen";
import DirectoryPage from "./pages/DirectoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const syncFromUrl = useStore((state) => state.syncFromUrl);

  useEffect(() => {
    // Attempt to sync from URL on app load if configured
    syncFromUrl();
  }, [syncFromUrl]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DirectoryPage defaultView="accordion" />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="tree" element={<DirectoryPage defaultView="tree" />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
