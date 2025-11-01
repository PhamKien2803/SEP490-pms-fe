import React, { useMemo, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Drawer,
  Grid,
} from "antd";
import {
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { logout } from "../../redux/authSlice";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { LocalStorageKey } from "../../types/local-storage";
import ErrorBoundary from "../../components/error-boundary/Error";
import './Dashboard.css';
import { toast } from "react-toastify";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const [collapsed, setCollapsed] = useLocalStorage(
    LocalStorageKey.IS_SIDE_BAR_COLLAPSED,
    false
  );
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { moduleMenu, user } = useSelector((state: RootState) => state.auth);

  const menuItems = useMemo(
    () =>
      moduleMenu.map((module) => ({
        key: module.moduleName,
        label: module.moduleName,
        icon: <AppstoreOutlined />,
        children: module.functions.map((func) => ({
          key: func.url,
          label: func.name,
        })),
      })),
    [moduleMenu]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMenuClick = (e: any) => {
    navigate(e.key);
    if (!screens.lg) setDrawerVisible(false);
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "logout",
          label: (
            <span style={{ color: "red" }}>
              <LogoutOutlined /> Đăng xuất
            </span>
          ),
          onClick: () => {
            dispatch(logout());
            toast.info("Đăng xuất thành công");
            document.title = "Hệ thống quản lý mầm non - Cá Heo Xanh";
            navigate("/login");
          },
        },
      ]}
    />
  );

  return (
    <Layout hasSider style={{ minHeight: "100vh" }}>
      {screens.lg && (
        <Layout.Sider
          collapsed={collapsed}
          trigger={null}
          width={250}
          collapsedWidth={80}
          style={{
            backgroundColor: "#fff",
            borderRight: "1px solid #f0f0f0",
            position: 'sticky',
            top: 0,
            height: '95vh',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
              color: "#1677ff",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {collapsed ? "PMS" : "PMS"}
          </div>

          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={moduleMenu.map((m) => m.moduleName)}
            items={menuItems}
            onClick={onMenuClick}
            style={{ borderRight: 0 }}
          />
        </Layout.Sider>
      )}

      <Layout>
        <Header
          style={{
            backgroundColor: "#fff",
            height: 64,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {screens.lg && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 40,
                  height: 40,
                }}
              />
            )}

            {!screens.lg && (
              <Button
                icon={<MenuOutlined />}
                type="text"
                onClick={() => setDrawerVisible(true)}
              />
            )}
          </div>
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <Button type="text" style={{ display: "flex", alignItems: "center" }}>
              <Avatar style={{ marginRight: 8 }} icon={<UserOutlined />} />
              <span style={{ marginRight: 8 }}>{user?.email}</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </Header>

        {!screens.lg && (
          <Drawer
            title="PMS"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={moduleMenu.map((m) => m.moduleName)}
              items={menuItems}
              onClick={onMenuClick}
            />
          </Drawer>
        )}

        <Content
          style={{
            backgroundColor: "#f9fafb",
          }}
        >
          <div style={{ padding: 24 }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;