import { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        "https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.netlogin",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = response.data.access_token;

      localStorage.setItem("access_token", token);

      // Switch from Login page to Dashboard
      setLoggedIn(true);

    } catch (error) {
      console.error(error);

      if (error.response) {
        setError(
          error.response.data.detail ||
            "Invalid email or password"
        );
      } else {
        setError(
          "Could not connect to the backend."
        );
      }
    }
  };

  // ---------------------------------------------
  // If logged in, show Dashboard
  // ---------------------------------------------

  if (loggedIn) {
    return (
      <Dashboard
        onLogout={() => setLoggedIn(false)}
      />
    );
  }

  // ---------------------------------------------
  // Otherwise show Login
  // ---------------------------------------------

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Clouddesk</h1>

        <p className="subtitle">
          Helpdesk Management System
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button type="submit">
            Login
          </button>

        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}

export default App;