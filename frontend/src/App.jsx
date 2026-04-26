import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function HomePage() {
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState([]);
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadPrograms = async () => {
      const query = search.trim();
      const endpoint = query
        ? `${API_BASE}/search?q=${encodeURIComponent(query)}`
        : `${API_BASE}/all`;

      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setPrograms(data);
      } catch (_error) {}
    };

    loadPrograms();

    return () => controller.abort();
  }, [search]);

  const handleCopy = async (id, code) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1200);
    } catch (_error) {}
  };

  return (
    <div className="page home-page">
      <div className="top-row">
        <input
          type="text"
          placeholder="Search by title/keywords"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/add" className="link-btn">
          Add Code
        </Link>
      </div>

      <div className="list">
        {programs.map((item) => (
          <div className="list-item" key={item._id}>
            <span>{item.title}</span>
            <button type="button" onClick={() => handleCopy(item._id, item.code)}>
              {copiedId === item._id ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddCodePage() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !code.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), code }),
      });

      if (response.ok) {
        setTitle("");
        setCode("");
      }
    } catch (_error) {}
  };

  return (
    <div className="page">
      <h1>Add Code</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Program title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Paste full program code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
        />

        <button type="submit">Submit</button>
      </form>

      <Link to="/" className="link-btn back-btn">
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/add" element={<AddCodePage />} />
    </Routes>
  );
}