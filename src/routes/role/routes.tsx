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
import TopicManagement from "../../pages/topic-management/TopicManagement";
import TopicCreate from "../../pages/topic-management/topic-create/TopicCreate";
import TopicUpdate from "../../pages/topic-management/topic-update/TopicUpdate";
import SchedulesManagement from "../../pages/schedules-management/SchedulesManagement";
import ClassInfor from "../../pages/teacher/class-information/ClassInfor";
import Attendance from "../../pages/teacher/attendance-student/Attendance";
import TakeAttendance from "../../pages/teacher/attendance-student/take-attendance/TakeAttendance";
import EditAttendance from "../../pages/teacher/attendance-student/edit-attendance/EditAttendance";
import AttendanceDetails from "../../pages/teacher/attendance-student/attendance-details/AttendanceDetails";
import StudentDetails from "../../pages/teacher/class-information/student-details/StudentDetails";
import ScheduleCreate from "../../pages/schedules-management/schedule-create/ScheduleCreate";
import MedicalManagement from "../../pages/medical-management/MedicalManagement";
import MedicalDetail from "../../pages/medical-management/medical-details/MedicalDetails";
import CreateMedical from "../../pages/medical-management/create-medical/CreateMedical";
import UpdateMedical from "../../pages/medical-management/edit-medical/EditMedical";
import TimeTable from "../../pages/teacher/time-table/TimeTable";
import FeedBack from "../../pages/teacher/feedbacks/FeedBack";
import TakeFeedback from "../../pages/teacher/feedbacks/take-feedback/TakeFeedback";
import EditFeedback from "../../pages/teacher/feedbacks/edit-feedback/EditFeedback";
import TeacherReport from "../../pages/teacher/teacher-report/TeacherReport";
import StudentInfo from "../../pages/parent-dashboard/dashboard-parents/StudentInfo";
import CreateReport from "../../pages/teacher/teacher-report/create-teacher-report/CreateReport";
import UpdateReport from "../../pages/teacher/teacher-report/update-teacher-report/UpdateReport";
import ReportDetails from "../../pages/teacher/teacher-report/teacher-report-details/ReportDetails";
import Feedback from "../../pages/parent-dashboard/feedback/Feedback";
import CheckIn from "../../pages/parent-dashboard/check-in/CheckIn";
import ClassChild from "../../pages/parent-dashboard/class-child/ClassChild";
import Schedule from "../../pages/parent-dashboard/schedule/Schedule";
import Menu from "../../pages/parent-dashboard/menu/Menu";
import Medical from "../../pages/parent-dashboard/medical/Medical";
import RevenueList from "../../pages/revenue-management/RevenueList";
import RevenueCreate from "../../pages/revenue-management/revenue-create/RevenueCreate";
import RevenueEdit from "../../pages/revenue-management/revenue-edit/RevenueEdit";
import TakeServices from "../../pages/parent-dashboard/take-services/TakeServices";
import RegisterServices from "../../pages/parent-dashboard/take-services/register-services/RegisterServices";
import ReceiptsManagement from "../../pages/receipts-management/ReceiptsManagement";
import ReceiptsCreate from "../../pages/receipts-management/receipts-create/ReceiptsCreate";
import ReceiptsEdit from "../../pages/receipts-management/receipts-edit/ReceiptsEdit";
import ReceiptsDetails from "../../pages/receipts-management/receipts-details/ReceiptsDetails";
import TuitionList from "../../pages/tuition-management/TuitionList";
import TuitionDetails from "../../pages/parent-dashboard/take-tuition/TuitionDetails";
import Payment from "../../pages/parent-dashboard/take-tuition/tuition-payment/Payment";
import HistoryFee from "../../pages/parent-dashboard/history-fee/HistoryFee";
import GuardianManagement from "../../pages/guardians/Guardians";
import BalancesDetails from "../../pages/balances-details/BalancesDetails";
import DocumentList from "../../pages/document-management/DocumentList";
import DocumentCreate from "../../pages/document-management/document-create/DocumentCreate";
import DocumentEdit from "../../pages/document-management/document-edit/DocumentEdit";
import ServicesReport from "../../pages/services-reports/ServicesReport";
import HomeNews from "../../pages/home-news/HomeNews";
import TeacherNews from "../../pages/home-news/home-news-teacher/TeacherNews";
import ParentNews from "../../pages/home-news/home-news-parent/ParentNews";

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
            element: <HomeNews />,
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
                element: <CurriculumsCreate />,
              },
              {
                path: "update/:id",
                element: <CurriculumsUpdate />,
              },
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
                element: <EventCreate />,
              },
              {
                path: "update/:id",
                element: <EventUpdate />,
              },
            ],
          },
          {
            path: "topics",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/topics`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TopicManagement />,
              },
              {
                path: "create",
                element: <TopicCreate />,
              },
              {
                path: "update/:id",
                element: <TopicUpdate />,
              },
            ],
          },
          {
            path: "schedules",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/schedules`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <SchedulesManagement />,
              },
              {
                path: "create",
                element: <ScheduleCreate />,
              },
            ],
          },
          {
            path: "teachers",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/teachers`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ClassInfor />,
              },
              {
                path: "students/detail/:id",
                element: <StudentDetails />,
              },
            ],
          },
          {
            path: "time-table",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/time-table`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TimeTable />,
              },
            ],
          },
          {
            path: "revenues",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/revenues`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <RevenueList />,
              },
              {
                path: "create",
                element: <RevenueCreate />,
              },
              {
                path: "edit/:id",
                element: <RevenueEdit />,
              },
            ],
          },
          {
            path: "services",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/services`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TakeServices />,
              },
              {
                path: "register",
                element: <RegisterServices />,
              },
            ],
          },
          {
            path: "receipts",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/receipts`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ReceiptsManagement />,
              },
              {
                path: "create",
                element: <ReceiptsCreate />,
              },
              {
                path: "edit/:id",
                element: <ReceiptsEdit />,
              },
              {
                path: "detail/:id",
                element: <ReceiptsDetails />,
              },
            ],
          },
          {
            path: "tuition-manage",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/tuition-manage`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TuitionList />,
              },
            ],
          },
          {
            path: "tuitions",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/tuitions`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TuitionDetails />,
              },
              {
                path: "payment",
                element: <Payment />,
              },
            ],
          },
          {
            path: "historyFees",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/historyFees`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <HistoryFee />,
              },
            ],
          },
          {
            path: "balances",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/balances`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <BalancesDetails />,
              },
            ],
          },
          {
            path: "documents",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/documents`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <DocumentList />,
              },
              {
                path: "create",
                element: <DocumentCreate />,
              },
              {
                path: "edit/:id",
                element: <DocumentEdit />,
              },
            ],
          },
          {
            path: "manage-services",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/manage-services`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ServicesReport />,
              },
            ],
          },
          {
            path: "attendances",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/attendances`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <Attendance />,
              },
              {
                path: "take-attendance",
                element: <TakeAttendance />,
              },
              {
                path: "update/:id",
                element: <EditAttendance />,
              },
              {
                path: "detail/:id",
                element: <AttendanceDetails />,
              },
            ],
          },
          {
            path: "feedbacks",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/feedbacks`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <FeedBack />,
              },
              {
                path: "take-feedback",
                element: <TakeFeedback />,
              },
              {
                path: "edit/:id",
                element: <EditFeedback />,
              },
            ],
          },
          {
            path: "lessons",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/lessons`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TeacherReport />,
              },
              {
                path: "create",
                element: <CreateReport />,
              },
              {
                path: "edit/:id",
                element: <UpdateReport />,
              },
              {
                path: "detail/:id",
                element: <ReportDetails />,
              },
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
          {
            path: "medicals",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/medicals`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <MedicalManagement />,
              },
              {
                path: "view/:id",
                element: <MedicalDetail />,
              },
              {
                path: "edit/:id",
                element: <UpdateMedical />,
              },
              {
                path: "create",
                element: <CreateMedical />,
              },
            ],
          },
          {
            path: "dashboard-parent",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-parent`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <StudentInfo />,
              },
            ],
          },
          {
            path: "dashboard-feedbacks",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-feedbacks`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <Feedback />,
              },
            ],
          },
          {
            path: "dashboard-medicals",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-medicals`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <Medical />,
              },
            ],
          },
          {
            path: "dashboard-attendances",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-attendances`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <CheckIn />,
              },
            ],
          },
          {
            path: "dashboard-class",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-class`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ClassChild />,
              },
            ],
          },
          {
            path: "dashboard-schedules",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-schedules`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <Schedule />,
              },
            ],
          },
          {
            path: "dashboard-menus",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-menus`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <Menu />,
              },
            ],
          },
          {
            path: "guardians",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/guardians`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <GuardianManagement />,
              },
            ],
          },
          {
            path: "posts",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/posts`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <TeacherNews />,
              },
            ],
          },
                    {
            path: "dashboard-posts",
            element: (
              <PrivateRoute
                requireFunction={`${constants.APP_PREFIX}/dashboard-posts`}
                requireAction="view"
              />
            ),
            children: [
              {
                index: true,
                element: <ParentNews />,
              },
            ],
          },
        ],
      },
    ],
  },
];
