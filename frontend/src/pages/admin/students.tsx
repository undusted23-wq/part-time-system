import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
  XIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import userService from "@/services/userService";
import authService from "@/services/authService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentUser | null>(null);

  // Form state for adding student
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    phoneNumber: ""
  });

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await userService.getUsersByRole("STUDENT");
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
        setErrorMessage("加载学生列表失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const refreshStudents = async () => {
    try {
      const data = await userService.getUsersByRole("STUDENT");
      setStudents(data);
    } catch (error) {
      console.error("Failed to refresh students:", error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setDialogError("两次输入的密码不匹配");
      return;
    }

    if (formData.password.length < 6) {
      setDialogError("密码必须至少6个字符");
      return;
    }

    setDialogLoading(true);

    try {
      await authService.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: "STUDENT"
      });

      // Reset form and close dialog
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        fullName: "",
        phoneNumber: ""
      });
      setDialogOpen(false);

      // Refresh student list
      await refreshStudents();

    } catch (err: any) {
      console.error("Failed to add student:", err);
      if (err.response?.data?.message) {
        setDialogError(err.response.data.message);
      } else {
        setDialogError("添加学生失败，请稍后再试");
      }
    } finally {
      setDialogLoading(false);
    }
  };

  const getActiveStatus = (student: StudentUser) => {
    if (typeof student.active === "boolean") {
      return student.active;
    }
    if (typeof student.isActive === "boolean") {
      return student.isActive;
    }
    return false;
  };

  // 前端过滤，服务端已返回全量学生数据
  const filteredStudents = students.filter(student => {
    const isActive = getActiveStatus(student);
    const status = isActive ? "active" : "inactive";
    // 状态筛选
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }

    // 搜索查询
    if (searchQuery && !student.username.includes(searchQuery) &&
      !(student.fullName || "").includes(searchQuery) &&
      !student.email.includes(searchQuery)) {
      return false;
    }

    return true;
  });

  const handleToggleActive = async (student: StudentUser) => {
    if (!student.id) {
      return;
    }
    const isActive = getActiveStatus(student);
    try {
      const updated = await userService.updateUser(student.id, {
        ...student,
        active: !isActive,
        isActive: !isActive
      });
      setStudents((prev) => prev.map((item) => (item.id === student.id ? updated : item)));
    } catch (error) {
      console.error("Failed to update student status:", error);
      setErrorMessage("更新学生状态失败，请稍后再试。");
    }
  };

  const handleEditStudent = async (student: StudentUser) => {
    if (!student.id) {
      return;
    }
    setStudentToEdit(student);
    setEditFormData({
      fullName: student.fullName || "",
      email: student.email || "",
      phoneNumber: student.phoneNumber || ""
    });
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!studentToEdit?.id) {
      return;
    }
    try {
      const updated = await userService.updateUser(studentToEdit.id, {
        ...studentToEdit,
        ...editFormData
      });
      setStudents((prev) => prev.map((item) => (item.id === studentToEdit.id ? updated : item)));
      setEditDialogOpen(false);
      setStudentToEdit(null);
    } catch (error) {
      console.error("Failed to update student info:", error);
      setErrorMessage("更新学生信息失败，请稍后再试。");
    }
  };

  const handleDeleteStudent = async (student: StudentUser) => {
    if (!student.id) {
      return;
    }
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete?.id) {
      return;
    }
    try {
      await userService.deleteUser(studentToDelete.id);
      setStudents((prev) => prev.filter((item) => item.id !== studentToDelete.id));
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      setErrorMessage("删除学生失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">学生管理</h1>
        <Button onClick={() => setDialogOpen(true)}>添加学生</Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索学生姓名、学号或邮箱..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="active">已激活</option>
          <option value="inactive">未激活</option>
        </select>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>学生列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">学号</th>
                  <th className="p-2 text-left font-medium">姓名</th>
                  <th className="p-2 text-left font-medium">邮箱</th>
                  <th className="p-2 text-left font-medium">手机号</th>
                  <th className="p-2 text-left font-medium">状态</th>
                  <th className="p-2 text-left font-medium">注册时间</th>
                  <th className="p-2 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const isActive = getActiveStatus(student);
                  return (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.username}</td>
                      <td className="p-2">{student.fullName || "-"}</td>
                      <td className="p-2">{student.email}</td>
                      <td className="p-2">{student.phoneNumber || "-"}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" :
                          "bg-yellow-100 text-yellow-800"
                          }`}>
                          {isActive ? "已激活" : "未激活"}
                        </span>
                      </td>
                      <td className="p-2">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditStudent(student)}
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">编辑</span>
                          </Button>
                          {isActive ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleToggleActive(student)}
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">停用</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleToggleActive(student)}
                            >
                              <CheckIcon className="h-4 w-4" />
                              <span className="sr-only">启用</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">删除</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">正在加载学生列表...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的学生</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredStudents.length} 条记录，共 {students.length} 条
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>上一页</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加学生</DialogTitle>
            <DialogDescription>
              创建新学生账户并添加到系统中
            </DialogDescription>
          </DialogHeader>

          {dialogError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {dialogError}
            </div>
          )}

          <form onSubmit={handleAddStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">全名 *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">电子邮箱 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">电话号码</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+86 123 4567 8900"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={dialogLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={dialogLoading}>
                {dialogLoading ? "添加中..." : "添加学生"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑学生信息</DialogTitle>
            <DialogDescription>
              编辑学生"{studentToEdit?.username}"的信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">姓名</Label>
              <Input
                id="edit-fullName"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phoneNumber">手机号</Label>
              <Input
                id="edit-phoneNumber"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={confirmEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除学生</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除学生"{studentToDelete?.username}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface StudentUser {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
}
