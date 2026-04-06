import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Legend from "./Legend";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-shell">
      <Sidebar />
      <TopBar />
      <main className="layout-shell__content">
        <Outlet />
      </main>
      <Legend />
    </div>
  );
}
