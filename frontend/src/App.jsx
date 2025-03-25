import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./router/Router"; // Renamed from Router.jsx to avoid confusion
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;