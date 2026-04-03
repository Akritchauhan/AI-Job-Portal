import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/Myapplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Applicants from "./pages/Applicants";
import Navbar from "./Components/Navbar";
import Notifications from "./Components/Notifications";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Navbar />
        <Notifications />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/view-applicants" element={<Applicants />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;