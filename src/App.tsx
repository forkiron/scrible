import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Digi from "./pages/Digi";
import Home from "./pages/Home";
import Option from "./pages/Option";

function App() {
  return (
    <Router>
      <div className="flex flex-col items-center justify-center w-full h-screen text-4xl text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Option" element={<Option />} />
          <Route path="/Digi" element={<Digi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
