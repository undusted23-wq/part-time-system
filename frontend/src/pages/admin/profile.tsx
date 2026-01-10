import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import userService, { UserProfile } from "@/services/userService";
import { z } from "zod";

// Password validation schema
const passwordSchema = z.string()
  .min(8, "密码长度至少8位")
  .regex(/[a-zA-Z]/, "密码必须包含字母")
  .regex(/[0-9]/, "密码必须包含数字");

export default function AdminProfile() {
  const [adminData, setAdminData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load current user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setAdminData(profile);
        setFormData({
          fullName: profile.fullName || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || ""
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        alert("加载个人资料失败，请刷新页面重试。");
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData?.id) {
      alert("用户信息加载失败，请刷新页面重试。");
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await userService.updateProfile(adminData.id, {
        ...adminData,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      setAdminData(updatedProfile);
      alert("个人资料已更新！");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("更新失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("两次输入的新密码不一致！");
      return;
    }

    // Validate password using Zod schema
    try {
      passwordSchema.parse(passwordData.newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(error.issues.map((e: { message: string }) => e.message).join("\n"));
        return;
      }
    }

    if (!adminData?.id) {
      alert("用户信息加载失败，请刷新页面重试。");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(adminData.id, passwordData.newPassword);
      alert("密码已更新！");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("密码更新失败，请检查当前密码是否正确。");
    } finally {
      setLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold">个人中心</h1>
        <div className="text-center text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">个人中心</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <form onSubmit={handleProfileSubmit}>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>查看和更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  value={adminData.username}
                  onChange={handleProfileChange}
                  disabled
                />
                <p className="text-xs text-muted-foreground">用户名不可更改</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">姓名</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">电子邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">手机号码</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Input
                  id="role"
                  name="role"
                  value={adminData.role}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>注册时间</Label>
                <div className="h-10 px-3 py-2 rounded-md bg-muted flex items-center text-sm">
                  {adminData.createdAt ? new Date(adminData.createdAt).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "更新中..." : "更新资料"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <form onSubmit={handlePasswordSubmit}>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>定期更新密码可以提高账户安全性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  密码长度至少8位，包含字母和数字
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "更新中..." : "更新密码"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>登录日志</CardTitle>
          <CardDescription>您的最近登录记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">时间</th>
                  <th className="p-2 text-left font-medium">IP地址</th>
                  <th className="p-2 text-left font-medium">设备</th>
                  <th className="p-2 text-left font-medium">浏览器</th>
                  <th className="p-2 text-left font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{log.time}</td>
                    <td className="p-2">{log.ip}</td>
                    <td className="p-2">{log.device}</td>
                    <td className="p-2">{log.browser}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === "成功" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 模拟数据 - 实际应用中应该从API获取
const loginLogs = [
  {
    time: "2025-04-13 15:30:22",
    ip: "192.168.1.1",
    device: "桌面设备",
    browser: "Chrome 114.0",
    status: "成功"
  },
  {
    time: "2025-04-12 09:15:45",
    ip: "192.168.1.1",
    device: "桌面设备",
    browser: "Chrome 114.0",
    status: "成功"
  },
  {
    time: "2025-04-11 18:20:10",
    ip: "114.88.123.45",
    device: "移动设备",
    browser: "Safari Mobile",
    status: "成功"
  },
  {
    time: "2025-04-10 12:05:33",
    ip: "114.88.123.45",
    device: "移动设备",
    browser: "Safari Mobile",
    status: "成功"
  },
  {
    time: "2025-04-09 22:45:15",
    ip: "123.45.67.89",
    device: "未知设备",
    browser: "未知浏览器",
    status: "失败"
  }
];
