import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/dashboard/HomePage";
import RootLayout from "./layouts/RootLayout";
import AddNewUser from "./pages/user/AddNewUser";
import ViewUser from "./pages/user/ViewUser";
import UserProfile from "./pages/user/UserProfile";
import Login from "./pages/authentication/Login";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import PermissionList from "./pages/permissions/PermissionList";
import Profile from "@/pages/profile/Profile";
import UserLayout from "./layouts/UserLayout";
import PermissionLayout from "./layouts/PermissionLayout";
import PasswordRecoveryPage from "@/pages/authentication/PasswordRecoveryPage";

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute authentication>
        <RootLayout>
          <App />
        </RootLayout>
      </ProtectedRoute>
    ),
    path: "/",
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/user/add-user",
        element: (
          <UserLayout>
            <AddNewUser />
          </UserLayout>
        ),
      },
      {
        path: "/user/view-user",
        element: (
          <UserLayout>
            <ViewUser />
          </UserLayout>
        ),
      },
      {
        path: "/user/view-user/:id",
        element: <UserProfile />,
      },
      {
        path: "/permission/list",
        element: (
          <PermissionLayout>
            <PermissionList />
          </PermissionLayout>
        ),
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <ProtectedRoute authentication={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <ProtectedRoute authentication={false}>
        <PasswordRecoveryPage />
      </ProtectedRoute>
    ),
  },
]);
