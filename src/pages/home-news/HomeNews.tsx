import { useMemo } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import AdminNews from "./home-news-admin/AdminNews";
import TeacherNews from "./home-news-teacher/TeacherNews";
import ParentNews from "./home-news-parent/ParentNews";
import { Button, Result } from "antd";
import { FrownOutlined } from "@ant-design/icons";
import ParentPreviewLanding from "./home-news-parentPreview/ParentPreviewLanding";

function HomeNews() {
    const user = useCurrentUser();

    const isAdmin = user?.isAdmin;
    const teacherId = useMemo(() => user?.staff, [user]);
    const parentId = useMemo(() => user?.parent, [user]);
    const isPreview = useMemo(() => user?.isPreview === true, [user]);

    if (isAdmin) return <AdminNews />;
    if (teacherId) return <TeacherNews />;

    if (parentId) {
        if (isPreview) {
            return <ParentPreviewLanding />;
        }
        return <ParentNews />;
    }

    return (
        <Result
            icon={<FrownOutlined />}
            title="Không xác định vai trò người dùng"
            subTitle="Vui lòng kiểm tra lại thông tin đăng nhập hoặc liên hệ quản trị viên."
            extra={
                <Button type="primary" onClick={() => window.location.reload()}>
                    Tải lại trang
                </Button>
            }
        />
    );
}

export default HomeNews;
