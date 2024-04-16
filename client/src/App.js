import { Routes, Route } from "react-router-dom";
// import Home from "./pages/home";
import NotFound from "./pages/notFound";
import Manager from "./pages/manager";

function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Home />} />
        <Route path="/gestor" element={<Manager />} /> */}
        <Route path="/" element={<Manager />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
