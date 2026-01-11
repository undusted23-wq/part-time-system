import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Settings() {
  const [companyData, setCompanyData] = useState({
    name: "科技创新有限公司",
    industry: "互联网/IT",
    size: "50-200人",
    website: "www.techcompany.com",
    email: "hr@techcompany.com",
    phone: "010-12345678",
    address: "北京市海淀区中关村软件园",
    description: "我们是一家专注于人工智能和数据分析的科技公司，致力于为企业提供智能化解决方案。"
  });

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">企业名称</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={companyData.name} 
                    onChange={handleCompanyDataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">所属行业</Label>
                  <Input 
                    id="industry" 
                    name="industry"
                    value={companyData.industry} 
                    onChange={handleCompanyDataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">企业规模</Label>
                  <Input 
                    id="size" 
                    name="size"
                    value={companyData.size} 
                    onChange={handleCompanyDataChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">企业网站</Label>
                  <Input 
                    id="website" 
                    name="website"
                    value={companyData.website} 
                    onChange={handleCompanyDataChange}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={companyData.phone} 
                    onChange={handleCompanyDataChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">公司地址</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={companyData.address} 
                    onChange={handleCompanyDataChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">公司介绍</Label>
                <textarea 
                  id="description" 
                  name="description"
                  rows={5} 
                  value={companyData.description} 
                  onChange={handleCompanyDataChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label>企业Logo</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-muted rounded flex items-center justify-center mb-4">
                    <span className="text-2xl text-muted-foreground">Logo</span>
                  </div>
                  <Button variant="outline" size="sm">上传Logo</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持JPG、PNG格式，最大2MB
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>保存更改</Button>
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
