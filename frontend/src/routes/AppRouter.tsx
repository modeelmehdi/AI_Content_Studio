import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import BlogGenerator from "../pages/BlogGenerator";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import GeneratorRoute from "./GeneratorRoute";
import History from "../pages/History";
import Settings from "../pages/Settings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route element={<ProtectedRoute/>}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Blog Generator */}
        <Route
          path="/blog-generator"
          element={<BlogGenerator />}
        />
        <Route path="/generate/:kind" element={<GeneratorRoute/>}/>
        <Route path="/history" element={<History/>}/>
        <Route path="/history/:id" element={<History/>}/>
        <Route path="/settings" element={<Settings/>}/>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}
