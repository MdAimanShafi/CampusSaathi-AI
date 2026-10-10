import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import AssistantPage from "./pages/AssistantPage";
import GrievancesPage from "./pages/GrievancesPage";
import NoticesPage from "./pages/NoticesPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import VoicePage from "./pages/VoicePage";
import IEEEPage from "./pages/IEEEPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/explore"    element={<ExplorePage />} />
          <Route path="/assistant"  element={<AssistantPage />} />
          <Route path="/voice"      element={<VoicePage />} />
          <Route path="/grievances" element={<GrievancesPage />} />
          <Route path="/notices"    element={<NoticesPage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/ieee"       element={<IEEEPage />} />
          <Route path="/about"      element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
