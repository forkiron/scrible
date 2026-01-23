import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Digi from "./pages/Digi";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SavedNotebooks from "./pages/SavedNotebooks";

function App() {
  return (
    <Router>
      <div className="flex flex-col items-center justify-center w-full min-h-screen text-4xl">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Digi" element={<Digi />} />
          <Route path="/login" element={<Login />} />
          <Route path="/SavedNotebooks" element={<SavedNotebooks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
