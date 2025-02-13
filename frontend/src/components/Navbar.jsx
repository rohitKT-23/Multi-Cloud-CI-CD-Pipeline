import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/login">Login</Link></li>  {/* 👈 Login Page Link */}
        <li><Link to="/register">Register</Link></li>  {/* 👈 Register Page Link */}
      </ul>
    </nav>
  );
};

export default Navbar;
