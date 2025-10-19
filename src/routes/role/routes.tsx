import { RouteObject } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";
import Dashboard from "../../pages/dash-board/Dashboard";
import { constants } from "../../constants";
import FunctionsManagement from "../../pages/functions-management/FunctionsManagement";
import ParentManagement from "../../pages/parent-management/ParentManagement";
import RoleManagement from "../../pages/role-management/RoleManagement";
import CreateRole from "../../pages/role-management/create-role/CreateRole";
import EditRole from "../../pages/role-management/edit-role/EditRole";
import StudentManagement from "../../pages/student-management/StudentManagement";
import AccountManagement from "../../pages/account-management/AccountManagement";
import StaffManagement from "../../pages/staff-management/StaffManagement";
import EnrollmentManagement from "../../pages/enrollment-management/EnrollmentManagement";
import EnrollmentDetail from "../../pages/enrollment-management/enrollment-details/EnrollmentDetail";
import EnrollmentEdit from "../../pages/enrollment-management/enrollment-edit/EnrollmentEdit";
import Admissions from "../../pages/admissions-report/Admissions";
import MenuManagement from "../../pages/menu-management/MenuManagement";
import MenuDetailPage from "../../pages/menu-management/detail/MenuDetail";
import EditMenuPage from "../../pages/menu-management/edit/EditMenu";
import CreateMenu from "../../pages/menu-management/create-menu/CreateMenu";
import SchoolYears from "../../pages/schoolyears-management/SchoolYears";
import EditSchoolyear from "../../pages/schoolyears-management/edit-schoolyear/EditSchoolyear";
import SchoolyearDetails from "../../pages/schoolyears-management/schoolyear-details/SchoolyearDetails";
import CreateSchoolyear from "../../pages/schoolyears-management/create-schoolyears/CreateSchoolyear";
import SchoolyearsReport from "../../pages/schoolyears-management/schoolyears-report/SchoolyearsReport";
import ClassManagement from "../../pages/class-management/ClassManagement";
import ClassDetails from "../../pages/class-management/class-details/ClassDetails";
import UpdateClass from "../../pages/class-management/class-update/UpdateClass";
import CreateClass from "../../pages/class-management/class-create/CreateClass";
import FoodManagement from "../../pages/food-management/FoodManagement";
import FoodDetailPage from "../../modal/food/view-food/FoodDetails";
import UpdateFoodPage from "../../modal/food/update-food/UpdateFood";
import CreateFoodPage from "../../modal/food/create-food/CreateFoodPage";
import CurriculumManagement from "../../pages/curriculum-management/CurriculumManagement";
import CurriculumsCreate from "../../pages/curriculum-management/curriculums-create/CurriculumsCreate";
import CurriculumsUpdate from "../../pages/curriculum-management/curriculums-update/CurriculumsUpdate";
import EventManagement from "../../pages/event-management/EventManagement";
import EventCreate from "../../pages/event-management/event-create/EventCreate";
import EventUpdate from "../../pages/event-management/event-update/EventUpdate";
import RoomManagement from "../../pages/room-management/RoomManagement";
import RoomDetails from "../../pages/room-management/room-details/RoomDetails";
import CreateRoom from "../../pages/room-management/create-room/CreateRoom";
import UpdateRoom from "../../pages/room-management/edit-room/UpdateRoom";
import RoomReport from "../../pages/room-report/RoomReport";

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
                element: <EnrollmentEdit />,
              },
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
                element: <EditMenuPage />,
              },
              {
                path: "create",
                element: <CreateMenu />,
              },
            ],
          },
          {
            path: "schoolYears",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/schoolYears`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <SchoolYears />,
              },
              {
                path: "edit/:id",
                element: <EditSchoolyear />,
              },
              {
                path: "view/:id",
                element: <SchoolyearDetails />,
              },
              {
                path: "create",
                element: <CreateSchoolyear />,
              },
            ],
          },
          {
            path: "school-years-report",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/school-years-report`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <SchoolyearsReport />,
              },
            ],
          },
          {
            path: "curriculums",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/curriculums`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <CurriculumManagement />,
              },
              {
                path: "create",
                element: <CurriculumsCreate />
              },
              {
                path: "update/:id",
                element: <CurriculumsUpdate />
              }
            ],
          },
          {
            path: "events",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/events`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <EventManagement />,
              },
              {
                path: "create",
                element: <EventCreate />
              },
              {
                path: "update/:id",
                element: <EventUpdate />
              }
            ],
          },
          {
            path: "classes",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/classes`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ClassManagement />,
              },
              {
                path: "view/:id",
                element: <ClassDetails />,
              },
              {
                path: "update/:id",
                element: <UpdateClass />,
              },
              {
                path: "create",
                element: <CreateClass />,
              },
            ],
          },
          {
            path: "foods",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/foods`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <FoodManagement />,
              },
              {
                path: "view/:id",
                element: <FoodDetailPage />,
              },
              {
                path: "edit/:id",
                element: <UpdateFoodPage />,
              },
              {
                path: "create",
                element: <CreateFoodPage />,
              },
            ],
          },
          {
            path: "rooms",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/rooms`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <RoomManagement />,
              },
              {
                path: "view/:id",
                element: <RoomDetails />,
              },
              {
                path: "edit/:id",
                element: <UpdateRoom />,
              },
              {
                path: "create",
                element: <CreateRoom />,
              },
            ],
          },
          {
            path: "rooms-report",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/rooms-report`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <RoomReport />,
              },
            ],
          },
        ],
      },
    ],
  },
];
