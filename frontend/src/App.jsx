import { Routes, Route } from "react-router-dom";
import SearchHome from "./pages/home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchHome />} />
      {/* Future routes */}
      {/* <Route path="/about" element={<About />} /> */}
    </Routes>
  );
}
