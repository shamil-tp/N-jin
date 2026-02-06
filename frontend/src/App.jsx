import { Routes, Route } from "react-router-dom";
import SearchHome from "./pages/home";
import SearchPage from "./pages/SearchPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchHome />} />
      <Route path="/search" element={<SearchPage/>} />
      {/* Future routes */}
      {/* <Route path="/about" element={<About />} /> */}
    </Routes>
  );
}
