import { useEffect, useState } from "react";
import axios from "axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

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
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <h2>Jobs</h2>

      {jobs.map((job) => (
        <div key={job.id}>
          <h3>{job.role}</h3>
          <p>{job.company_name}</p>
          <p>{job.description}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}