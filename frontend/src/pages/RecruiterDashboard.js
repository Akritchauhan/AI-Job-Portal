import { useEffect, useState } from "react";
import axios from "axios";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // 🔥 Fetch recruiter jobs
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/jobs/my-jobs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setJobs(res.data))
      .catch(() => alert("Failed to load jobs"));
  }, []);

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
    } catch {
      alert("Failed to load applicants");
    }
  };

  return (
    <div>
      <h2>Recruiter Dashboard</h2>

      <h3>Your Jobs</h3>
      {jobs.map((job) => (
        <div key={job.id}>
          <p>{job.role} - {job.company_name}</p>
          <button onClick={() => getApplicants(job.id)}>
            View Applicants
          </button>
        </div>
      ))}

      <h3>Applicants</h3>
      {applicants.map((app) => (
        <div key={app.id}>
          <p><strong>Student:</strong> {app.student}</p>
          <p><strong>Match Score:</strong> {app.match_score}</p>
          <p><strong>Status:</strong> {app.status}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}