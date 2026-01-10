import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BadgeCheckIcon, 
  BuildingIcon, 
  CheckIcon,
  SearchIcon, 
  XIcon 
} from "lucide-react";
import { useEffect, useState } from "react";
import companyService, { Company } from "@/services/companyService";

export default function CompanyManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await companyService.getAllCompaniesAuth();
        setCompanies(data);
      } catch (error) {
        console.error("Failed to load companies:", error);
        setErrorMessage("加载企业列表失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const getVerifiedStatus = (company: Company) => {
    if (typeof company.isVerified === "boolean") {
      return company.isVerified;
    }
    if (typeof company.verified === "boolean") {
      return company.verified;
    }
    return false;
  };

  const industries = Array.from(
    new Set(companies.map((company) => company.industry).filter(Boolean))
  ) as string[];
  
  // 前端过滤，服务端已返回全量企业数据
  const filteredCompanies = companies.filter(company => {
    const isVerified = getVerifiedStatus(company);
    // 状态筛选
    if (statusFilter !== "all") {
      if (statusFilter === "verified" && !isVerified) {
        return false;
      }
      if (statusFilter === "unverified" && isVerified) {
        return false;
      }
    }
    
    // 行业筛选
    if (industryFilter !== "all" && company.industry !== industryFilter) {
      return false;
    }
    
    // 搜索查询
    if (
      searchQuery &&
      !company.name.includes(searchQuery) &&
      !(company.contactEmail || "").includes(searchQuery) &&
      !(company.contactPhone || "").includes(searchQuery)
    ) {
      return false;
    }
    
    return true;
  });

  const handleVerifyCompany = async (company: Company, verified: boolean) => {
    if (!company.id) {
      return;
    }
    try {
      const updated = await companyService.verifyCompany(company.id, verified);
      setCompanies((prev) => prev.map((item) => (item.id === company.id ? updated : item)));
    } catch (error) {
      console.error("Failed to update company status:", error);
      setErrorMessage("更新企业认证状态失败，请稍后再试。");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">企业信息管理</h1>
        <Button disabled>添加企业</Button>
      </div>
      
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="搜索企业名称或联系方式..." 
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
          <option value="verified">已认证</option>
          <option value="unverified">未认证</option>
        </select>
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
        >
          <option value="all">所有行业</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle>企业列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">企业名称</th>
                  <th className="p-2 text-left font-medium">行业</th>
                  <th className="p-2 text-left font-medium">联系邮箱</th>
                  <th className="p-2 text-left font-medium">联系电话</th>
                  <th className="p-2 text-left font-medium">状态</th>
                  <th className="p-2 text-left font-medium">注册时间</th>
                  <th className="p-2 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => {
                  const isVerified = getVerifiedStatus(company);
                  return (
                    <tr key={company.id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {isVerified && (
                            <BadgeCheckIcon className="h-4 w-4 text-blue-500" />
                          )}
                          <span>{company.name}</span>
                        </div>
                      </td>
                      <td className="p-2">{company.industry}</td>
                      <td className="p-2">{company.contactEmail || "-"}</td>
                      <td className="p-2">{company.contactPhone || "-"}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isVerified ? "bg-green-100 text-green-800" : 
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {isVerified ? "已认证" : "未认证"}
                        </span>
                      </td>
                      <td className="p-2">
                        {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-1">
                          {isVerified ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleVerifyCompany(company, false)}
                            >
                              <XIcon className="h-4 w-4" />
                              <span className="sr-only">取消认证</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleVerifyCompany(company, true)}
                            >
                              <CheckIcon className="h-4 w-4" />
                              <span className="sr-only">认证</span>
                            </Button>
                          )}
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
              <p className="text-center text-muted-foreground">正在加载企业列表...</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-500">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredCompanies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-muted-foreground">没有找到符合条件的企业</p>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示 {filteredCompanies.length} 条记录，共 {companies.length} 条
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">企业分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">共有企业数量</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BuildingIcon className="h-4 w-4 text-green-500" />
                  已认证
                </span>
                <span>{companies.filter(c => getVerifiedStatus(c)).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <BuildingIcon className="h-4 w-4 text-gray-500" />
                  未认证
                </span>
                <span>{companies.filter(c => !getVerifiedStatus(c)).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">行业分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px] flex items-center justify-center">
              <p className="text-muted-foreground">饼图区域</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">最新待认证企业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies
                .filter(c => !getVerifiedStatus(c))
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .slice(0, 3)
                .map(company => (
                  <div key={company.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-xs text-muted-foreground">
                        提交于 {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleVerifyCompany(company, true)}>
                      审核
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
