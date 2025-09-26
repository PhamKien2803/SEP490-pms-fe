import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { paths } from "@/routes/paths";

function PublicRoute() {
    const { user } = useAuth();

    if (user) {
        // Đã login thì không cho vào /login nữa → redirect về dashboard
        return <Navigate to={paths.HOME} replace />;
    }
    // Chưa login → render tiếp nội dung bên trong
    return <Outlet />;
}

export default PublicRoute;
