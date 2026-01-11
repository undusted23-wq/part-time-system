import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import axios from "axios";
import authService from "@/services/authService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id;
  const token = localStorage.getItem('token');

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    skills: ""
  });

  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    newJobs: true,
    applicationUpdates: true,
    messages: true,
    reviews: true
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // 获取当前用户数据
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = response.data;
        setProfileData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          skills: userData.skills || ""
        });
      } catch (error) {
        console.error('获取用户数据失败:', error);
        toast.error("获取用户数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  // 保存个人信息
  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      await axios.put(`http://localhost:8080/api/users/${userId}`, profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("保存成功！");
    } catch (error) {
      console.error('保存失败:', error);
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">设置</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="security">安全</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">加载中...</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
                <CardDescription>
                  管理您的个人信息，这些信息将显示给潜在雇主
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">姓名</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">电子邮箱</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">电话号码</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">技能</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleProfileChange}
                      placeholder="逗号分隔，例如: React, Vue, TypeScript"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存更改"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>
                管理您希望接收哪些通知以及如何接收
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">通知渠道</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">电子邮件通知</Label>
                      <p className="text-sm text-muted-foreground">通过邮件接收通知</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appNotifications">应用内通知</Label>
                      <p className="text-sm text-muted-foreground">在应用内显示通知</p>
                    </div>
                    <Switch
                      id="appNotifications"
                      checked={notifications.app}
                      onCheckedChange={(checked) => handleNotificationChange("app", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">通知类型</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newJobs">新职位推荐</Label>
                      <p className="text-sm text-muted-foreground">当有符合您兴趣的新职位时通知您</p>
                    </div>
                    <Switch
                      id="newJobs"
                      checked={notifications.newJobs}
                      onCheckedChange={(checked) => handleNotificationChange("newJobs", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="applicationUpdates">申请状态更新</Label>
                      <p className="text-sm text-muted-foreground">当您的申请状态有变化时通知您</p>
                    </div>
                    <Switch
                      id="applicationUpdates"
                      checked={notifications.applicationUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("applicationUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="messages">新消息</Label>
                      <p className="text-sm text-muted-foreground">当收到新消息时通知您</p>
                    </div>
                    <Switch
                      id="messages"
                      checked={notifications.messages}
                      onCheckedChange={(checked) => handleNotificationChange("messages", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reviews">新评价</Label>
                      <p className="text-sm text-muted-foreground">当收到新评价时通知您</p>
                    </div>
                    <Switch
                      id="reviews"
                      checked={notifications.reviews}
                      onCheckedChange={(checked) => handleNotificationChange("reviews", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>保存设置</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>
                管理您的账户安全和隐私设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">修改密码</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={security.currentPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={handleSecurityChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>更新密码</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">账户管理</h3>
                <Button variant="destructive">注销账户</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
