import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/Myapplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Applicants from "./pages/Applicants";
import Navbar from "./Components/Navbar";
{window.location.pathname !== "/" && <Navbar />}
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/view-applicants" element={<Applicants />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;