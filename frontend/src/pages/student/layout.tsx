import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ActivityIcon,
  BellIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CogIcon,
  FileTextIcon,
  GraduationCapIcon,
  HomeIcon,
  LogOutIcon,
  MessagesSquareIcon,
  SearchIcon,
  StarIcon,
  UserIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import authService from "@/services/authService";

export default function StudentLayout() {
  const currentUser = authService.getCurrentUser();
  const displayName = currentUser?.username || "学生";
  const displayEmail = currentUser?.email || "student@example.com";

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-muted/5">
      <aside className="border-r border-border bg-gradient-to-b from-indigo-50 to-indigo-100 text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 bg-gradient-to-r from-indigo-600 to-indigo-800">
          <GraduationCapIcon className="h-6 w-6 text-white" />
          <h1 className="text-lg font-semibold text-white">学生门户</h1>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg shadow-sm">
            <Avatar>
              <AvatarImage src="/student-avatar.png" alt="Student" />
              <AvatarFallback className="bg-indigo-600 text-white">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
          </div>
        </div>
        <nav className="grid gap-4 px-2">
          <div className="mb-2">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">主要功能</p>
          </div>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-800 mr-2">
                <HomeIcon className="h-4 w-4" />
              </div>
              <span>仪表盘</span>
              <Badge variant="outline" className="ml-auto text-xs">新</Badge>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/search" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-800 mr-2">
                <SearchIcon className="h-4 w-4" />
              </div>
              <span>查找工作</span>
            </Link>
          </Button>
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-6">工作管理</p>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/applications" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-800 mr-2">
                <BriefcaseIcon className="h-4 w-4" />
              </div>
              <span>我的申请</span>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/saved" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-800 mr-2">
                <BookmarkIcon className="h-4 w-4" />
              </div>
              <span>保存的工作</span>
            </Link>
          </Button>
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-6">个人信息</p>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/resume" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-800 mr-2">
                <FileTextIcon className="h-4 w-4" />
              </div>
              <span>我的简历</span>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/reviews" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-800 mr-2">
                <StarIcon className="h-4 w-4" />
              </div>
              <span>我的评价</span>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/messages" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-800 mr-2">
                <MessagesSquareIcon className="h-4 w-4" />
              </div>
              <span>消息</span>
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/aibot" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-800 mr-2">
                <MessagesSquareIcon className="h-4 w-4" />
              </div>
              <span>智能助手</span>
            </Link>
          </Button>
          <Separator className="my-2" />

          <Button variant="ghost" className="justify-start gap-2 hover:bg-indigo-200" asChild>
            <Link to="/student/settings" className="relative group">
              <span className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-gray-800 mr-2">
                <CogIcon className="h-4 w-4" />
              </div>
              <span>设置</span>
            </Link>
          </Button>
        </nav>
      </aside>
      <main className="flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <ActivityIcon className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">学生控制面板</h2>
            <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">在线</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <UserIcon className="h-3 w-3" />
              我的资料
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              <span className="sr-only">通知</span>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/student/settings">
                <CogIcon className="h-5 w-5" />
                <span className="sr-only">设置</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Link to="/login">
                <LogOutIcon className="h-5 w-5" />
                <span className="sr-only">登出</span>
              </Link>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mb-6 bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 rounded-lg shadow-md text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">您好，沈同学</h3>
                <p className="text-indigo-100">您有 <span className="font-semibold">3</span> 个未处理的应用和 <span className="font-semibold">2</span> 条新消息</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg text-center">
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs text-indigo-100">可申请岗位</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
