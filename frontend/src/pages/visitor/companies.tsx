import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import companyService from "@/services/companyService";
import { Building2, Search, MapPin, Mail, Phone, Globe, ArrowLeft } from "lucide-react";

export default function VisitorCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    setLoading(true);
    companyService.getAllCompanies()
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("获取企业信息失败:", error);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      loadCompanies();
      return;
    }

    setLoading(true);
    companyService.searchCompanies({ name: searchQuery })
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("搜索企业失败:", error);
        setLoading(false);
      });
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query) ||
      company.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <header className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <Link to="/visitor/home" className="flex items-center gap-2 text-blue-900 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
            <h1 className="text-2xl font-bold">浏览企业信息</h1>
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">登录</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto py-12">
        {/* 搜索栏 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索企业名称、行业或地点..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>
              {searchQuery && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  loadCompanies();
                }}>
                  清除
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 企业列表 */}
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无企业信息</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {company.logoUrl ? (
                        <img
                          src={companyService.resolveLogoUrl(company.logoUrl)}
                          alt={company.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        {(company.verified || company.isVerified) && (
                          <Badge variant="default" className="mt-1">已认证</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {company.industry && (
                    <CardDescription>
                      <Badge variant="outline">{company.industry}</Badge>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    {company.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.contactEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{company.contactEmail}</span>
                      </div>
                    )}
                    {company.contactPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{company.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            共找到 {filteredCompanies.length} 家企业
          </div>
        )}
      </main>
    </div>
  );
}
