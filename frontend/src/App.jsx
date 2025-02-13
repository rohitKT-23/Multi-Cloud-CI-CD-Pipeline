import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";  // 👈 Login Page Import Kiya
import Register from "./pages/Register";  // 👈 Register Page Import Kiya
import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />  {/* 👈 Login Route */}
        <Route path="/register" element={<Register />} />  {/* 👈 Register Route */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
