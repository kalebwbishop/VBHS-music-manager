import React, { useState } from "react";
import PropTypes from "prop-types";
import "./AuthComponent.css";

const AuthComponent = ({ setRefresh }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerToken, setRegisterToken] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSignIn = async () => {
    // Start sign-in request
    setLoading(true);

    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          console.error("Authentication failed");
          setError(data.message);
          return;
        }

        // Save token to local storage
        localStorage.setItem("token", data.accessToken);
        setRefresh((prev) => !prev);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchSignUp = () => {
    setLoading(true);
    fetch(`${window.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        registerToken,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          console.error("Registration failed");
          setError(data.message);
          setLoading(false);
          return;
        }

        fetchSignIn();
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle sign in or sign up logic here
    if (isSignUp && password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    if (isSignUp) {
      fetchSignUp();
    } else {
      fetchSignIn();
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      {error && <p className="error-message">{error}</p>}
      {loading && (
        <div className="loading-indicator" style={{ marginBottom: "1rem", color: "#333" }}>
          <span style={{ marginRight: 8 }}>⏳</span>
          <strong>Please wait — signing in...</strong>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            If the backend has been idle this may take longer to start (up to 30 seconds).
          </div>
        </div>
      )}
      <div className="tab-container">
        <button
          onClick={() => setIsSignUp(false)}
          className={!isSignUp ? "auth-button-active" : "auth-button"}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={isSignUp ? "auth-button-active" : "auth-button"}
        >
          Sign Up
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isSignUp && (
          <>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="regesterToken">Registration Token:</label>
              <input
                type="text"
                id="regesterToken"
                value={registerToken}
                onChange={(e) => setRegisterToken(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <button type="submit" className="auth-button">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
    </div>
  );
};

AuthComponent.propTypes = {
  setRefresh: PropTypes.func.isRequired,
};

export default AuthComponent;
