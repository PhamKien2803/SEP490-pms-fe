import { RouteObject } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import Dashboard from '../../pages/dash-board/Dashboard';
import UserManagement from '../../pages/user-management/UserManagement';
import { constants } from '../../constants';
import FunctionsManagement from '../../pages/functions-management/FunctionsManagement';
import ParentManagement from '../../pages/parent-management/ParentManagement';
import RoleManagement from '../../pages/role-management/RoleManagement';
import CreateRole from '../../pages/create-role/CreateRole';
import EditRole from '../../pages/edit-role/EditRole';

export const routes: RouteObject[] = [
    {
        path: constants.APP_PREFIX,
        element: <PrivateRoute requireFunction={constants.APP_PREFIX} requireAction="view" />,
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
                                element: <UserManagement />,
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
                                path: "edit/:roleId",
                                element: <EditRole />,
                            }
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
                    }
                ],
            },
        ],
    },
];

