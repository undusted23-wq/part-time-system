import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// 使用懒加载减少初始加载时间
const StudentDashboard = lazy(() => import("../pages/student/index"));
const JobSearch = lazy(() => import("../pages/student/search"));
const Applications = lazy(() => import("../pages/student/applications"));
const SavedJobs = lazy(() => import("../pages/student/saved"));
const Resume = lazy(() => import("../pages/student/resume"));
const Reviews = lazy(() => import("../pages/student/reviews"));
const Messages = lazy(() => import("../pages/student/messages"));
const Settings = lazy(() => import("../pages/student/settings"));
const AiBot = lazy(() => import("../pages/student/aibot"));

// 学生端路由配置
const studentRoutes: RouteObject[] = [
  {
    index: true, // 默认路径 "/student"
    element: <StudentDashboard />
  },
  {
    path: "search",
    element: <JobSearch />
  },
  {
    path: "applications",
    element: <Applications />
  },
  {
    path: "saved",
    element: <SavedJobs />
  },
  {
    path: "resume",
    element: <Resume />
  },
  {
    path: "reviews",
    element: <Reviews />
  },
  {
    path: "messages",
    element: <Messages />
  },
  {
    path: "settings",
    element: <Settings />
  },
  {
    path: "aibot",
    element: <AiBot />
  }
];

export default studentRoutes;
