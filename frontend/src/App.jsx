import { useState } from "react";
import axios from "axios";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import "./App.css";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      setError("Please upload a resume file (PDF or DOCX).");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "https://resume-matcher-vy07.onrender.com/api/match",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>AI Resume & Job Matcher</h1>
          <p>Upload your resume and a job description to get an instant match score</p>
        </header>

        <div className="card">
          <div className="upload-section">
            <label className="upload-label">
              <Upload size={20} />
              <span>{resumeFile ? resumeFile.name : "Upload Resume (PDF or DOCX)"}</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                hidden
              />
            </label>
          </div>

          <div className="textarea-section">
            <label>Job Description</label>
            <textarea
              rows={8}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spin" size={18} /> Analyzing...
              </>
            ) : (
              "Analyze Match"
            )}
          </button>
        </div>

        {result && (
          <div className="card result-card">
            <div className="score-section">
              <div
                className="score-circle"
                style={{ borderColor: getScoreColor(result.matchPercentage) }}
              >
                <span style={{ color: getScoreColor(result.matchPercentage) }}>
                  {result.matchPercentage}%
                </span>
              </div>
              <p className="summary">{result.summary}</p>
            </div>

            <div className="skills-grid">
              <div className="skills-box">
                <h3><CheckCircle size={18} color="#22c55e" /> Matched Skills</h3>
                <ul>
                  {result.matchedSkills.map((skill, i) => (
                    <li key={i} className="matched">{skill}</li>
                  ))}
                </ul>
              </div>

              <div className="skills-box">
                <h3><XCircle size={18} color="#ef4444" /> Missing Skills</h3>
                <ul>
                  {result.missingSkills.map((skill, i) => (
                    <li key={i} className="missing">{skill}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="suggestions-box">
              <h3><FileText size={18} /> Improvement Suggestions</h3>
              <ul>
                {result.improvementSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;