import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Digi from "./pages/Digi";
import Home from "./pages/Home";
import Option from "./pages/Option";
import Landing from "./pages/Landing";

function App() {
  return (
    <Router>
      <div className="flex flex-col items-center justify-center w-full min-h-screen text-4xl">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Option" element={<Option />} />
          <Route path="/Digi" element={<Digi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
