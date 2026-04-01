import { useEffect, useState } from "react";
import axios from "axios";
import "./RecruiterDashboard.css";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [sortBy, setSortBy] = useState("score-high");
  const [newJob, setNewJob] = useState({
    role: "",
    company_name: "",
    description: "",
    skills_required: "",
    deadline: "",
  });

  // 🔥 Fetch recruiter jobs
  useEffect(() => {
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
    } catch {
      alert("Failed to load jobs");
    }
  };

  // 🔥 Create new job
  const handleCreateJob = async () => {
    if (!newJob.role || !newJob.company_name || !newJob.description || !newJob.skills_required || !newJob.deadline) {
      alert("Please fill all fields including deadline");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/jobs/post/", newJob, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Job posted successfully!");
      setNewJob({ role: "", company_name: "", description: "", skills_required: "", deadline: "" });
      setShowCreateJob(false);
      fetchJobs();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.response?.statusText || err.message;
      alert("Failed to create job: " + errorMsg);
    }
  };

  // 🔥 Fetch applicants
  const getApplicants = async (jobId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/jobs/applicants/${jobId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplicants(res.data);
      setSelectedJobId(jobId);
      setSortBy("score-high");
    } catch {
      alert("Failed to load applicants");
    }
  };

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
      alert("Status updated successfully!");
      // Refetch applicants to update the list
      if (selectedJobId) {
        getApplicants(selectedJobId);
      }
    } catch (err) {
      alert("Failed to update status: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  // 🔥 Sort applicants
  const getSortedApplicants = () => {
    let sorted = [...applicants];
    
    switch(sortBy) {
      case "score-high":
        sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        break;
      case "score-low":
        sorted.sort((a, b) => (a.match_score || 0) - (b.match_score || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  };

  const getStatusLabel = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const sortedApplicants = getSortedApplicants();

  return (
    <div className="recruiter-container">
      <div className="recruiter-header">
        <h2>Recruiter Dashboard</h2>
        <p>Manage job postings and review applicants</p>
      </div>

      <div className="recruiter-section">
        <div className="section-header">
          <h3>📋 Your Job Postings</h3>
          <button 
            className="create-job-btn"
            onClick={() => setShowCreateJob(!showCreateJob)}
          >
            {showCreateJob ? "✕ Cancel" : "+ Post New Job"}
          </button>
        </div>

        {showCreateJob && (
          <div className="create-job-form">
            <h4>Create New Job Posting</h4>
            <div className="form-group">
              <label htmlFor="role">Job Title</label>
              <input
                id="role"
                placeholder="e.g., Senior Developer"
                value={newJob.role}
                onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                id="company"
                placeholder="Your company name"
                value={newJob.company_name}
                onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                placeholder="Describe the job, responsibilities, and perks..."
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label htmlFor="skills">Required Skills</label>
              <textarea
                id="skills"
                placeholder="List required skills, e.g.: Python, React, SQL, REST APIs, Git"
                value={newJob.skills_required}
                onChange={(e) => setNewJob({ ...newJob, skills_required: e.target.value })}
                rows="3"
              />
              <small className="help-text">Separate multiple skills with commas</small>
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Application Deadline</label>
              <input
                id="deadline"
                type="date"
                value={newJob.deadline}
                onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
              />
              <small className="help-text">Last date for applications</small>
            </div>
            <div className="form-actions">
              <button className="submit-btn" onClick={handleCreateJob}>
                Post Job
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateJob(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>No job postings yet. Create one to start receiving applications!</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <p className="job-role">{job.role}</p>
                <p className="company-name">🏢 {job.company_name}</p>
                {job.deadline && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                )}

                <button
                  className="view-btn"
                  onClick={() => getApplicants(job.id)}
                >
                  👥 View Applicants
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJobId && (
        <div className="recruiter-section">
          <div className="section-header">
            <h3>📨 Applications</h3>
            <div className="sort-container">
              <label htmlFor="sort-applicants">Sort by:</label>
              <select 
                id="sort-applicants"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="score-high">Highest Match Score</option>
                <option value="score-low">Lowest Match Score</option>
              </select>
            </div>
          </div>

          {applicants.length === 0 ? (
            <div className="empty-state">
              <p>No applications for this job yet.</p>
            </div>
          ) : (
            <div className="applicants-list">
              {sortedApplicants.map((app) => (
                <div key={app.id} className="applicant-card">
                  <div className="applicant-info">
                    <p className="applicant-name">👤 {app.student.full_name || app.student.username}</p>
                    <p className="applicant-email">{app.student.email}</p>
                    <p className="applicant-detail">
                      <strong>Match Score:</strong>{" "}
                      <span className="match-score">{app.match_score}%</span>
                    </p>
                  </div>
                  <div className="applicant-actions">
                    <span className={`applicant-status ${getStatusClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    <div className="status-buttons">
                      <button
                        className="status-btn in-review"
                        onClick={() => handleUpdateStatus(app.id, "in_review")}
                        title="Mark as Under Review"
                      >
                        Review
                      </button>
                      <button
                        className="status-btn shortlisted"
                        onClick={() => handleUpdateStatus(app.id, "shortlisted")}
                        title="Mark as Shortlisted"
                      >
                        Shortlist
                      </button>
                      <button
                        className="status-btn hired"
                        onClick={() => handleUpdateStatus(app.id, "hired")}
                        title="Mark as Hired"
                      >
                        Hire
                      </button>
                      <button
                        className="status-btn rejected"
                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                        title="Mark as Rejected"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}