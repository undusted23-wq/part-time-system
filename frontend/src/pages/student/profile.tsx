import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CameraIcon, SaveIcon, UserIcon } from "lucide-react";
import userService, { UserProfile } from "@/services/userService";

interface ProfileForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  skills: string;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phoneNumber: "",
    skills: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          skills: data.skills || ""
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        setErrorMessage("加载个人信息失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!profile?.id) {
      return;
    }
    setSaving(true);
    try {
      const updated = await userService.updateProfile(profile.id, {
        ...profile,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        skills: form.skills
      });
      setProfile(updated);
      alert("保存成功！");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("保存失败，请稍后再试。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">个人中心</h1>
        <Button onClick={handleSave} disabled={saving || loading}>
          <SaveIcon className="h-4 w-4 mr-2" />
          保存更改
        </Button>
      </div>

      {errorMessage && (
        <div className="text-sm text-red-500">{errorMessage}</div>
      )}

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>个人资料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src="/placeholder-avatar.jpg"
                  alt="个人头像"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <CameraIcon className="h-4 w-4" />
                  <span className="sr-only">更换头像</span>
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-medium">{profile?.fullName || profile?.username || "学生"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email || "-"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">账号信息</span>
              </div>
              <div className="pl-6 grid gap-3">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">用户名</span>
                  <span>{profile?.username || "-"}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">角色</span>
                  <span>{profile?.role || "STUDENT"}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">注册时间</span>
                  <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">姓名</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">技能标签</Label>
              <Textarea
                id="skills"
                placeholder="例如：React, Java, 数据分析"
                value={form.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
