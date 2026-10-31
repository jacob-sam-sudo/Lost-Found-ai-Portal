
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreateItem from "./pages/CreateItem";
import Profile from "./pages/Profile";
import MyItems from "./pages/MyItems";
import ItemDetails from "./pages/ItemDetails";
import EditItem from "./pages/EditItem";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminItems from "./pages/AdminItems";
import AdminMatches from "./pages/AdminMatches";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import ReceivedClaims from "./pages/ReceivedClaims";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/items/edit/:id" element={<EditItem />} />
            <Route path="/create-item" element={<CreateItem />} />
            <Route path="/my-items" element={<MyItems />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/matches" element={<Matches />} />

          </Route><Route
  path="/ownership/received"
  element={<ReceivedClaims />}
/>

          <Route path="/chat/:chatId" element={<Chat />} />
        </Route>

        {/* Admin-Only Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
            <Route
  path="/admin/users"
  element={<AdminUsers />}
/>
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/matches" element={<AdminMatches />} />
        <Route
  path="/admin/activity-logs"
  element={<AdminActivityLogs />}
/>
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
