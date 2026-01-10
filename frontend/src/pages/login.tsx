import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "student";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
        <Link to="/" className="mb-8 text-xl font-bold text-blue-900">
          大学生兼职服务管理系统
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>登录您的账户</CardTitle>
            <CardDescription>
              输入您的凭证以访问您的{role === "admin" ? "管理员" : role === "student" ? "学生" : "雇主"}账户
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setIsLoading(true);
              
              try {
                const response = await authService.login({ username, password });
                // 从响应中直接获取role
                if (response.role.toLowerCase() !== role.toLowerCase() && role !== "admin") {
                  setError(`您尝试以${role === "student" ? "学生" : "雇主"}身份登录，但您的账户类型是${response.role.toLowerCase() === "student" ? "学生" : response.role.toLowerCase() === "employer" ? "雇主" : "管理员"}`);
                } else {
                  // Redirect based on user role
                  const redirectPath = response.role.toLowerCase() === "admin" 
                    ? "/admin" 
                    : response.role.toLowerCase() === "employer"
                      ? "/employer"
                      : "/student";
                  navigate(redirectPath);
                }
              } catch (err) {
                console.error("Login error:", err);
                setError("登录失败：用户名或密码错误");
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
                    placeholder="请输入用户名" 
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                      忘记密码？
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <div className="text-sm text-gray-600">
              还没有账户？{" "}
              <Link to={`/register${role ? `?role=${role}` : ""}`} className="text-blue-600 hover:underline">
                在此注册
              </Link>
            </div>
            {role !== "student" && (
              <div className="text-sm">
                <Link to="/login?role=student" className="text-blue-600 hover:underline">
                  以学生身份登录
                </Link>
              </div>
            )}
            {role !== "employer" && (
              <div className="text-sm">
                <Link to="/login?role=employer" className="text-blue-600 hover:underline">
                  以雇主身份登录
                </Link>
              </div>
            )}
            {role !== "admin" && (
              <div className="text-sm">
                <Link to="/login?role=admin" className="text-blue-600 hover:underline">
                  以管理员身份登录
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
