import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../contexts/NotificationContext";
import "./Applicants.css";

export default function Applicants() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const { error, success } = useNotification();
  
  // 🔥 Role validation
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else if (role !== "recruiter") {
      error("Unauthorized! Only recruiters can access this page.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  }, [token, role, navigate]);

  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("score-high");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJobId, setFilterJobId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);

  // 🔥 Fetch all applicants and jobs
  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/jobs/my-jobs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/jobs/all-applicants/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplicants(res.data);
      setFilteredApplicants(res.data);
    } catch (err) {
      error("Failed to load applicants");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Apply filters and sorting
  useEffect(() => {
    let filtered = [...applicants];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    // Filter by job
    if (filterJobId !== "all") {
      filtered = filtered.filter((app) => app.job.id === parseInt(filterJobId));
    }

    // Search by student name or email
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.student.full_name.toLowerCase().includes(term) ||
          app.student.email.toLowerCase().includes(term) ||
          app.student.username.toLowerCase().includes(term)
      );
    }

    // Sort
    switch (sortBy) {
      case "score-high":
        filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        break;
      case "score-low":
        filtered.sort((a, b) => (a.match_score || 0) - (b.match_score || 0));
        break;
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.applied_at) - new Date(a.applied_at)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.applied_at) - new Date(b.applied_at)
        );
        break;
      default:
        break;
    }

    setFilteredApplicants(filtered);
  }, [applicants, sortBy, filterStatus, filterJobId, searchTerm]);

  // 🔥 Update applicant status
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/jobs/update-status/${applicationId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update local state
      const updated = applicants.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplicants(updated);
      success("Status updated successfully!");
    } catch (err) {
      error("Failed to update status: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  // 🔥 Download resume
  const downloadResume = (resumeUrl, studentName) => {
    if (resumeUrl) {
      const link = document.createElement("a");
      link.href = `http://127.0.0.1:8000${resumeUrl}`;
      link.download = `${studentName}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(/_/g, "-")}`;
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  if (loading) {
    return (
      <div className="applicants-container">
        <div className="loading">Loading applicants...</div>
      </div>
    );
  }

  return (
    <div className="applicants-container">
      <div className="applicants-header">
        <div className="header-content">
          <h2>👥 All Applicants</h2>
          <p className="applicants-count">Total applicants: <strong>{filteredApplicants.length}</strong></p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="filter-job">Filter by Job:</label>
            <select
              id="filter-job"
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.role} - {job.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-status">Filter by Status:</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="score-high">Score (High to Low)</option>
              <option value="score-low">Score (Low to High)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      {filteredApplicants.length === 0 ? (
        <div className="empty-state">
          <p>No applicants found matching your filters.</p>
        </div>
      ) : (
        <div className="applicants-table-container">
          <table className="applicants-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Job Applied</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.id} className="applicant-row">
                  <td className="student-name">
                    <strong>{applicant.student.full_name}</strong>
                    <br />
                    <small>@{applicant.student.username}</small>
                  </td>
                  <td>{applicant.student.email}</td>
                  <td>
                    <div className="job-info">
                      <strong>{applicant.job.role}</strong>
                      <br />
                      <small>{applicant.job.company_name}</small>
                    </div>
                  </td>
                  <td>
                    <div
                      className="score-badge"
                      style={{ color: getScoreColor(applicant.match_score) }}
                    >
                      🎯 {applicant.match_score?.toFixed(1) || 0}%
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(applicant.status)}`}>
                      {getStatusLabel(applicant.status)}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(applicant.applied_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="download-btn"
                      onClick={() =>
                        downloadResume(applicant.resume, applicant.student.full_name)
                      }
                      title="Download Resume"
                    >
                      📥 Download
                    </button>
                  </td>
                  <td>
                    <div className="action-dropdown">
                      <select
                        className="status-select"
                        value={applicant.status}
                        onChange={(e) =>
                          handleUpdateStatus(applicant.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in_review">In Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
