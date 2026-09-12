import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CreateItem from "./pages/CreateItem";
import Profile from "./pages/Profile";
import MyItems from "./pages/MyItems";
import ItemDetails from "./pages/ItemDetails";
import EditItem from "./pages/EditItem";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/explore"
              element={<Explore />}
            />

            <Route
              path="/items/:id"
              element={<ItemDetails />}
            />

            <Route
              path="/items/edit/:id"
              element={<EditItem />}
            />

            <Route
              path="/create-item"
              element={<CreateItem />}
            />

            <Route
              path="/my-items"
              element={<MyItems />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
};

export default App;