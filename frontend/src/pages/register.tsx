import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import authService from "@/services/authService";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialRole = searchParams.get("role") || "student";
  const [role, setRole] = useState(initialRole);
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <Link to="/" className="mb-8 text-xl font-bold text-blue-900">
          大学生兼职服务管理系统
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>创建您的账户</CardTitle>
            <CardDescription>
              注册以{role === "student" ? "寻找兼职工作" : "发布工作机会"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={role} onValueChange={setRole} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">学生</TabsTrigger>
                <TabsTrigger value="employer">雇主</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <p className="mb-4 text-sm text-gray-600">
                  创建学生账户以搜索并申请符合您时间安排的兼职工作。
                </p>
              </TabsContent>
              <TabsContent value="employer">
                <p className="mb-4 text-sm text-gray-600">
                  创建雇主账户以发布工作机会并找到合格的学生。
                </p>
              </TabsContent>
            </Tabs>

            {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            {success && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">注册成功！正在跳转到登录页面...</div>}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              
              // Validate form
              if (password !== confirmPassword) {
                setError("两次输入的密码不匹配");
                return;
              }
              
              if (password.length < 6) {
                setError("密码必须至少6个字符");
                return;
              }
              
              setIsLoading(true);
              
              try {
                await authService.register({
                  username,
                  password,
                  email,
                  fullName,
                  phoneNumber,
                  role: role.toUpperCase() === "STUDENT" ? "STUDENT" : "EMPLOYER"
                });
                
                setSuccess(true);
                
                // Redirect to login after successful registration
                setTimeout(() => {
                  navigate(`/login?role=${role}`);
                }, 2000);
                
              } catch (err: any) {
                console.error("Registration error:", err);
                if (err.response) {
                  // Check for specific error messages from the API
                  if (err.response.status === 400) {
                    // Bad request - likely validation errors or duplicate
                    if (err.response.data && err.response.data.message) {
                      setError(err.response.data.message);
                    } else if (err.response.data && !err.response.data.success) {
                      // Handle the ApiResponse format from our backend
                      setError(err.response.data.message || "用户名或邮箱已被使用");
                    } else {
                      setError("请检查您的输入并重试");
                    }
                  } else if (err.response.status === 500) {
                    // Server error
                    setError("服务器错误，请稍后再试");
                  } else {
                    // Other HTTP errors
                    setError(`注册失败 (${err.response.status}): 请稍后再试`);
                  }
                } else if (err.request) {
                  // Network error - no response
                  setError("网络错误，请检查您的连接");
                } else {
                  // Other errors
                  setError("注册失败，请稍后再试");
                }
              } finally {
                setIsLoading(false);
              }
            }}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">全名</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">电话号码</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    placeholder="+86 123 4567 8900" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "注册中..." : "注册"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center">
            <div className="text-sm text-gray-600">
              已经有账户了吗？{" "}
              <Link to={`/login${role ? `?role=${role}` : ""}`} className="text-blue-600 hover:underline">
                在此登录
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
