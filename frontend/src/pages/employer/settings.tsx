import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Building2Icon, LoaderCircleIcon, UploadIcon } from "lucide-react";
import companyService, { Company } from "@/services/companyService";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Settings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    logoUrl: ""
  });
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    newApplications: true,
    applicationUpdates: true,
    messages: true,
    platformUpdates: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompany(true);
      setCompanyError(null);
      try {
        const data = await companyService.getEmployerCompanies();
        const list = Array.isArray(data) ? data : [];
        setCompanies(list);
        setSelectedCompanyId(list[0]?.id || null);
      } catch (error) {
        console.error("Failed to load employer companies:", error);
        setCompanyError("加载企业信息失败，请稍后再试。");
      } finally {
        setLoadingCompany(false);
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setCompanyData({
        name: "",
        industry: "",
        website: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        logoUrl: ""
      });
      setLogoPreviewUrl("");
      return;
    }

    setCompanyData({
      name: selectedCompany.name || "",
      industry: selectedCompany.industry || "",
      website: selectedCompany.website || "",
      email: selectedCompany.contactEmail || "",
      phone: selectedCompany.contactPhone || "",
      address: selectedCompany.location || "",
      description: selectedCompany.description || "",
      logoUrl: selectedCompany.logoUrl || ""
    });
    setLogoPreviewUrl(companyService.resolveLogoUrl(selectedCompany.logoUrl));
  }, [selectedCompany]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleCompanyDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string) => {
    setNotificationSettings(prev => ({ ...prev, [name]: !prev[name as keyof typeof notificationSettings] }));
  };

  const handleSaveCompany = async () => {
    if (!selectedCompany?.id) {
      toast.error("请先创建企业后再设置资料。");
      return;
    }

    setSavingCompany(true);
    try {
      const updated = await companyService.updateCompany(selectedCompany.id, {
        ...selectedCompany,
        name: companyData.name.trim(),
        industry: companyData.industry.trim() || undefined,
        website: companyData.website.trim() || undefined,
        contactEmail: companyData.email.trim() || undefined,
        contactPhone: companyData.phone.trim() || undefined,
        location: companyData.address.trim() || undefined,
        description: companyData.description.trim() || undefined,
        logoUrl: companyData.logoUrl || undefined
      });

      setCompanies((prev) => prev.map((company) => (company.id === updated.id ? updated : company)));
      setCompanyData((prev) => ({ ...prev, logoUrl: updated.logoUrl || "" }));
      setLogoPreviewUrl(companyService.resolveLogoUrl(updated.logoUrl));
      toast.success("企业资料已保存");
    } catch (error) {
      console.error("Failed to save company settings:", error);
      toast.error("保存企业资料失败，请稍后再试。");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleLogoButtonClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !selectedCompany?.id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("请上传 JPG、PNG、WebP 等图片文件。");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo 文件不能超过 2MB。");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (logoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(previewUrl);
    setUploadingLogo(true);

    try {
      const updated = await companyService.uploadCompanyLogo(selectedCompany.id, file);
      setCompanies((prev) => prev.map((company) => (company.id === updated.id ? updated : company)));
      setCompanyData((prev) => ({ ...prev, logoUrl: updated.logoUrl || "" }));

      URL.revokeObjectURL(previewUrl);
      setLogoPreviewUrl(companyService.resolveLogoUrl(updated.logoUrl));
      toast.success("企业 Logo 上传成功");
    } catch (error) {
      console.error("Failed to upload company logo:", error);
      URL.revokeObjectURL(previewUrl);
      setLogoPreviewUrl(companyService.resolveLogoUrl(companyData.logoUrl));
      toast.error("上传 Logo 失败，请稍后再试。");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">设置</h1>
      
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">企业资料</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="security">账户安全</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>企业资料</CardTitle>
              <CardDescription>
                管理您的企业信息，这些信息将显示给求职者
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyError && (
                <div className="text-sm text-red-500">{companyError}</div>
              )}

              <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                <div className="space-y-2">
                  <Label htmlFor="companySelector">选择企业</Label>
                  <select
                    id="companySelector"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={selectedCompanyId || ""}
                    onChange={(e) => setSelectedCompanyId(Number(e.target.value) || null)}
                    disabled={loadingCompany || savingCompany || uploadingLogo}
                  >
                    <option value="">请选择企业</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>企业 Logo</Label>
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center gap-3 min-h-[180px]">
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="企业 Logo 预览"
                        className="w-20 h-20 rounded-xl object-cover border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center">
                        <Building2Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleLogoButtonClick}
                      disabled={!selectedCompanyId || loadingCompany || savingCompany || uploadingLogo}
                    >
                      {uploadingLogo ? <LoaderCircleIcon className="h-4 w-4 mr-2 animate-spin" /> : <UploadIcon className="h-4 w-4 mr-2" />}
                      {uploadingLogo ? "上传中..." : "上传 Logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      支持 JPG、PNG、WebP，最大 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">企业名称</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={companyData.name} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">所属行业</Label>
                  <Input 
                    id="industry" 
                    name="industry"
                    value={companyData.industry} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">办公地点</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={companyData.address} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">企业网站</Label>
                  <Input 
                    id="website" 
                    name="website"
                    value={companyData.website} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">联系邮箱</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={companyData.email} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={companyData.phone} 
                    onChange={handleCompanyDataChange}
                    disabled={loadingCompany || !selectedCompanyId}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">公司介绍</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  rows={5} 
                  value={companyData.description} 
                  onChange={handleCompanyDataChange}
                  disabled={loadingCompany || !selectedCompanyId}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} disabled={!selectedCompanyId || loadingCompany || savingCompany || uploadingLogo}>
                  {savingCompany ? "保存中..." : "保存更改"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>
                管理您希望接收的通知类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">通知类型</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="cursor-pointer" htmlFor="newApplications">收到新申请</Label>
                      <p className="text-sm text-muted-foreground">当有求职者申请您发布的职位时通知您</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="newApplications"
                        checked={notificationSettings.newApplications}
                        onChange={() => handleNotificationChange('newApplications')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="cursor-pointer" htmlFor="applicationUpdates">申请状态更新</Label>
                      <p className="text-sm text-muted-foreground">当申请状态变更时通知您</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="applicationUpdates"
                        checked={notificationSettings.applicationUpdates}
                        onChange={() => handleNotificationChange('applicationUpdates')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="cursor-pointer" htmlFor="messages">收到新消息</Label>
                      <p className="text-sm text-muted-foreground">当收到求职者的新消息时通知您</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="messages"
                        checked={notificationSettings.messages}
                        onChange={() => handleNotificationChange('messages')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="cursor-pointer" htmlFor="platformUpdates">平台更新</Label>
                      <p className="text-sm text-muted-foreground">接收平台功能更新和公告</p>
                    </div>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="platformUpdates"
                        checked={notificationSettings.platformUpdates}
                        onChange={() => handleNotificationChange('platformUpdates')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">通知接收方式</h3>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="emailNotification" defaultChecked />
                    <Label htmlFor="emailNotification" className="text-sm font-medium cursor-pointer">电子邮件</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="smsNotification" />
                    <Label htmlFor="smsNotification" className="text-sm font-medium cursor-pointer">短信</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="appNotification" defaultChecked />
                    <Label htmlFor="appNotification" className="text-sm font-medium cursor-pointer">应用内通知</Label>
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
              <CardTitle>账户安全</CardTitle>
              <CardDescription>
                管理您的账户安全设置
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
                      value={passwordData.currentPassword} 
                      onChange={handlePasswordChange}
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
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>更新密码</Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">双因素认证</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">提高账户安全性</p>
                    <p className="text-sm text-muted-foreground">
                      通过手机验证码进行二次验证
                    </p>
                  </div>
                  <Button variant="outline">设置</Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">账户管理</h3>
                <div className="flex gap-4">
                  <Button variant="outline">注销账户</Button>
                  <Button variant="destructive">删除账户</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
