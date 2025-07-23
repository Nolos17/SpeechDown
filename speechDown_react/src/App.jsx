import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Children from "./pages/Children";
import Activities from "./pages/Activities";
import ActivityDetail from "./pages/ActivityDetail";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Router>
          <nav className="navbar navbar-expand navbar-light bg-light p-3">
            <Link className="navbar-brand" to="/">
              SpeechDown
            </Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/users">
                Usuarios
              </Link>
              <Link className="nav-link" to="/children">
                Niños
              </Link>
              <Link className="nav-link" to="/activities">
                Actividades
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/children" element={<Children />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
