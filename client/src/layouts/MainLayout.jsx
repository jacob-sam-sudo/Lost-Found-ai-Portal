import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <Navbar />

      <main className="min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;