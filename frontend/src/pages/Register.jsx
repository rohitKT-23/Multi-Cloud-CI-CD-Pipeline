import React, { useState } from "react";
import axios from "../services/api"; // API service ko import kiya

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Confirmation message ke liye

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/users/register", { name, email, password });
      setMessage(response.data.message); // Success message show karega
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {message && <p>{message}</p>} {/* Message show karega */}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
