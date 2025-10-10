import { RouteObject } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";
import Dashboard from "../../pages/dash-board/Dashboard";
import { constants } from "../../constants";
import FunctionsManagement from "../../pages/functions-management/FunctionsManagement";
import ParentManagement from "../../pages/parent-management/ParentManagement";
import RoleManagement from "../../pages/role-management/RoleManagement";
import CreateRole from "../../pages/create-role/CreateRole";
import EditRole from "../../pages/edit-role/EditRole";
import StudentManagement from "../../pages/student-management/StudentManagement";
import AccountManagement from '../../pages/account-management/AccountManagement';
import StaffManagement from "../../pages/staff-management/StaffManagement";
import EnrollmentManagement from "../../pages/enrollment-management/EnrollmentManagement";
import EnrollmentDetail from "../../pages/enrollment-details/EnrollmentDetail";
import EnrollmentEdit from "../../pages/enrollment-edit/EnrollmentEdit";
import Admissions from "../../pages/admissions-report/Admissions";
import MenuManagement from "../../pages/menu-management/MenuManagement";
import MenuDetailPage from "../../pages/menu-management/detail/MenuDetail";
import EditMenuPage from "../../pages/menu-management/edit/EditMenu";
import CreateMenu from "../../pages/menu-management/create-menu/CreateMenu";

export const routes: RouteObject[] = [
    {
        path: constants.APP_PREFIX,
        element: (
            <PrivateRoute
                requireFunction={constants.APP_PREFIX}
                requireAction="view"
            />
        ),
        children: [
            {
                path: "",
                element: <Dashboard />,
                children: [
                    {
                        index: true,
                        element: <div>Trang chủ PMS</div>,
                    },
                    {
                        path: "accounts",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/accounts`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <AccountManagement />,
                            },
                        ],
                    },
                    {
                        path: "roles",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/roles`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <RoleManagement />,
                            },
                            {
                                path: "create",
                                element: <CreateRole />,
                            },
                            {
                                path: "edit/:id",
                                element: <EditRole />,
                            },
                        ],
                    },
                    {
                        path: "functions",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/functions`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <FunctionsManagement />,
                            },
                        ],
                    },
                    {
                        path: "students",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/students`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <StudentManagement />,
                            },
                        ],
                    },
                    {
                        path: "staffs",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/staffs`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <StaffManagement />,
                            },
                        ],
                    },
                    {
                        path: "parents",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/parents`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <ParentManagement />,
                            },
                        ],
                    },
                    {
                        path: "enrollments",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/enrollments`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <EnrollmentManagement />,
                            },
                            {
                                path: "view/:id",
                                element: <EnrollmentDetail />,
                            },
                            {
                                path: "edit/:id",
                                element: <EnrollmentEdit />
                            }
                        ],
                    },
                    {
                        path: "admissions",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/admissions`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <Admissions />,
                            },
                        ],
                    },
                     {
                        path: "menus",
                        element: (
                            <PrivateRoute
                                requireFunction={`${constants.APP_PREFIX}/menus`}
                                requireAction="view"
                            />
                        ),
                        children: [
                            {
                                index: true,
                                element: <MenuManagement />,
                            },
                            {
                                path: "view/:id",
                                element: <MenuDetailPage />,
                            },
                            {
                                path: "edit/:id",
                                element: <EditMenuPage />
                            },
                             {
                                path: "create",
                                element: <CreateMenu />
                            }
                        ],
                    },
                ],
            },
        ],
    },
];
