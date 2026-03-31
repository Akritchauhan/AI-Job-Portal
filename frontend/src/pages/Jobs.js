import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  
import "./Jobs.css";  
export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [file, setFile] = useState(null);

  // 🔥 Fetch jobs
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/jobs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setJobs(res.data);
      })
      .catch(() => {
        alert("Failed to load jobs");
      });
  }, []);

  // 🔥 Apply function
  const handleApply = async (jobId) => {
    if (!file) {
      alert("Please select a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/jobs/apply/${jobId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Applied! Match Score: " + res.data.match_score);
    } catch (err) {
      if (err.response) {
        alert("Error: " + JSON.stringify(err.response.data));
      } else {
        alert("Application failed");
      }
    }
  };

  return (
    <div>
      <h2>Jobs</h2>
      <Link to="/my-applications">View My Applications</Link>
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
        <h3>{job.role}</h3>
        <p><strong>Company:</strong> {job.company_name}</p>
        <p>{job.description}</p>
      
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      
        <button
          className="apply-btn"
          onClick={() => handleApply(job.id)}
        >
          Apply
        </button>
      </div>
      ))}
    </div>
  );
}