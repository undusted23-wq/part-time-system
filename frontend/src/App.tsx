import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
// 导入页面
// 使用懒加载进行代码分割
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("./pages/home"));
const LoginPage = lazy(() => import("./pages/login"));
const RegisterPage = lazy(() => import("./pages/register"));
const AdminLayout = lazy(() => import("./pages/admin/layout"));
const EmployerLayout = lazy(() => import("./pages/employer/layout"));
const StudentLayout = lazy(() => import("./pages/student/layout"));

// 游客模块页面组件
const VisitorHome = lazy(() => import("./pages/visitor/home"));
const VisitorCompanies = lazy(() => import("./pages/visitor/companies"));
const VisitorJobs = lazy(() => import("./pages/visitor/jobs"));
const VisitorReviews = lazy(() => import("./pages/visitor/reviews"));

// 管理员页面组件
const AdminDashboard = lazy(() => import("./pages/admin/index"));
const AdminProfile = lazy(() => import("./pages/admin/profile"));
const AdminStudents = lazy(() => import("./pages/admin/students"));
const AdminResumes = lazy(() => import("./pages/admin/resumes"));
const AdminCompanies = lazy(() => import("./pages/admin/companies"));
const AdminJobs = lazy(() => import("./pages/admin/jobs"));
const AdminApplications = lazy(() => import("./pages/admin/applications"));
const AdminReviews = lazy(() => import("./pages/admin/reviews"));
const AdminMessages = lazy(() => import("./pages/admin/messages"));
const AdminSystem = lazy(() => import("./pages/admin/system"));

// 学生页面组件
const StudentDashboard = lazy(() => import("./pages/student/index"));
const StudentProfile = lazy(() => import("./pages/student/profile"));
const JobSearch = lazy(() => import("./pages/student/search"));
const StudentApplications = lazy(() => import("./pages/student/applications"));
const SavedJobs = lazy(() => import("./pages/student/saved"));
const Resume = lazy(() => import("./pages/student/resume"));
const Reviews = lazy(() => import("./pages/student/reviews"));
const WriteReview = lazy(() => import("./pages/student/write-review"));
const StudentMessages = lazy(() => import("./pages/student/messages"));
const StudentSettings = lazy(() => import("./pages/student/settings"));
const StudentAiBot = lazy(() => import("./pages/student/aibot"));
// 企业页面组件
const EmployerDashboard = lazy(() => import("./pages/employer/index"));
const EmployerProfile = lazy(() => import("./pages/employer/profile"));
const EmployerJobs = lazy(() => import("./pages/employer/jobs"));
const PostJob = lazy(() => import("./pages/employer/post-job"));
const EmployerApplications = lazy(() => import("./pages/employer/applications"));
const EmployerReviews = lazy(() => import("./pages/employer/reviews"));
const EmployerFavorites = lazy(() => import("./pages/employer/favorites"));
const Analytics = lazy(() => import("./pages/employer/analytics"));
const EmployerMessages = lazy(() => import("./pages/employer/messages"));
const EmployerSettings = lazy(() => import("./pages/employer/settings"));

// 包装所有路由的根布局组件
function RootLayout() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Suspense fallback={<div className="flex h-screen items-center justify-center">加载中...</div>}>
          <Outlet />
        </Suspense>
      </ThemeProvider>
    </div>
  );
}

// 创建路由器配置
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      // 游客模块路由（无需登录）
      { path: "/visitor/home", element: <Suspense fallback={<div>加载中...</div>}><VisitorHome /></Suspense> },
      { path: "/visitor/companies", element: <Suspense fallback={<div>加载中...</div>}><VisitorCompanies /></Suspense> },
      { path: "/visitor/jobs", element: <Suspense fallback={<div>加载中...</div>}><VisitorJobs /></Suspense> },
      { path: "/visitor/reviews", element: <Suspense fallback={<div>加载中...</div>}><VisitorReviews /></Suspense> },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Suspense fallback={<div>加载中...</div>}><AdminDashboard /></Suspense> },
          { path: "profile", element: <Suspense fallback={<div>加载中...</div>}><AdminProfile /></Suspense> },
          { path: "students", element: <Suspense fallback={<div>加载中...</div>}><AdminStudents /></Suspense> },
          { path: "resumes", element: <Suspense fallback={<div>加载中...</div>}><AdminResumes /></Suspense> },
          { path: "companies", element: <Suspense fallback={<div>加载中...</div>}><AdminCompanies /></Suspense> },
          { path: "jobs", element: <Suspense fallback={<div>加载中...</div>}><AdminJobs /></Suspense> },
          { path: "applications", element: <Suspense fallback={<div>加载中...</div>}><AdminApplications /></Suspense> },
          { path: "reviews", element: <Suspense fallback={<div>加载中...</div>}><AdminReviews /></Suspense> },
          { path: "messages", element: <Suspense fallback={<div>加载中...</div>}><AdminMessages /></Suspense> },
          { path: "system", element: <Suspense fallback={<div>加载中...</div>}><AdminSystem /></Suspense> },
        ],
      },
      {
        path: "/employer",
        element: <EmployerLayout />,
        children: [
          { index: true, element: <Suspense fallback={<div>加载中...</div>}><EmployerDashboard /></Suspense> },
          { path: "profile", element: <Suspense fallback={<div>加载中...</div>}><EmployerProfile /></Suspense> },
          { path: "jobs", element: <Suspense fallback={<div>加载中...</div>}><EmployerJobs /></Suspense> },
          { path: "post-job", element: <Suspense fallback={<div>加载中...</div>}><PostJob /></Suspense> },
          { path: "applications", element: <Suspense fallback={<div>加载中...</div>}><EmployerApplications /></Suspense> },
          { path: "reviews", element: <Suspense fallback={<div>加载中...</div>}><EmployerReviews /></Suspense> },
          { path: "favorites", element: <Suspense fallback={<div>加载中...</div>}><EmployerFavorites /></Suspense> },
          { path: "analytics", element: <Suspense fallback={<div>加载中...</div>}><Analytics /></Suspense> },
          { path: "messages", element: <Suspense fallback={<div>加载中...</div>}><EmployerMessages /></Suspense> },
          { path: "settings", element: <Suspense fallback={<div>加载中...</div>}><EmployerSettings /></Suspense> },
        ],
      },
      {
        path: "/student",
        element: <StudentLayout />,
        children: [
          { index: true, element: <Suspense fallback={<div>加载中...</div>}><StudentDashboard /></Suspense> },
          { path: "profile", element: <Suspense fallback={<div>加载中...</div>}><StudentProfile /></Suspense> },
          { path: "search", element: <Suspense fallback={<div>加载中...</div>}><JobSearch /></Suspense> },
          { path: "applications", element: <Suspense fallback={<div>加载中...</div>}><StudentApplications /></Suspense> },
          { path: "saved", element: <Suspense fallback={<div>加载中...</div>}><SavedJobs /></Suspense> },
          { path: "resume", element: <Suspense fallback={<div>加载中...</div>}><Resume /></Suspense> },
          { path: "reviews", element: <Suspense fallback={<div>加载中...</div>}><Reviews /></Suspense> },
          { path: "write-review", element: <Suspense fallback={<div>加载中...</div>}><WriteReview /></Suspense> },
          { path: "messages", element: <Suspense fallback={<div>加载中...</div>}><StudentMessages /></Suspense> },
          { path: "settings", element: <Suspense fallback={<div>加载中...</div>}><StudentSettings /></Suspense> },
          { path: "aibot", element: <Suspense fallback={<div>加载中...</div>}><StudentAiBot /></Suspense> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
