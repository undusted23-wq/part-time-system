import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheckIcon, BuildingIcon, CameraIcon, LoaderCircleIcon, SaveIcon } from "lucide-react";
import companyService, { Company } from "@/services/companyService";
import { toast } from "sonner";

export default function EmployerProfile() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    website: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await companyService.getEmployerCompanies();
        const list = Array.isArray(data) ? data : [];
        setCompanies(list);
        if (list.length > 0) {
          setSelectedCompanyId(list[0].id || null);
        }
      } catch (error) {
        console.error("Failed to load companies:", error);
        setErrorMessage("加载公司信息失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  useEffect(() => {
    if (!selectedCompany) {
      setForm({
        name: "",
        description: "",
        industry: "",
        location: "",
        website: "",
        logoUrl: "",
        contactEmail: "",
        contactPhone: ""
      });
      return;
    }

    setForm({
      name: selectedCompany.name || "",
      description: selectedCompany.description || "",
      industry: selectedCompany.industry || "",
      location: selectedCompany.location || "",
      website: selectedCompany.website || "",
      logoUrl: selectedCompany.logoUrl || "",
      contactEmail: selectedCompany.contactEmail || "",
      contactPhone: selectedCompany.contactPhone || ""
    });
  }, [selectedCompany]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!selectedCompany?.id) {
      return;
    }
    setSaving(true);
    try {
      const updated = await companyService.updateCompany(selectedCompany.id, {
        ...selectedCompany,
        ...form,
        name: form.name
      });
      setCompanies((prev) => prev.map((item) => (item.id === selectedCompany.id ? updated : item)));
      toast.success("保存成功");
    } catch (error) {
      console.error("Failed to update company:", error);
      toast.error("保存失败，请稍后再试。");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !selectedCompany?.id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片格式的企业 Logo。");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo 文件不能超过 2MB。");
      return;
    }

    setUploadingLogo(true);
    try {
      const updated = await companyService.uploadCompanyLogo(selectedCompany.id, file);
      setCompanies((prev) => prev.map((item) => (item.id === selectedCompany.id ? updated : item)));
      setForm((prev) => ({ ...prev, logoUrl: updated.logoUrl || "" }));
      toast.success("企业 Logo 已更新");
    } catch (error) {
      console.error("Failed to upload company logo:", error);
      toast.error("上传 Logo 失败，请稍后再试。");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">企业中心</h1>
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
            <CardTitle>公司信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={companyService.resolveLogoUrl(selectedCompany?.logoUrl) || "/placeholder-company-logo.jpg"}
                  alt="企业logo"
                  className="w-32 h-32 rounded-lg object-cover border-4 border-blue-100"
                />
                <label className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo || saving || loading || !selectedCompany?.id}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                    disabled={uploadingLogo || saving || loading || !selectedCompany?.id}
                    asChild
                  >
                    <span>
                      {uploadingLogo ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <CameraIcon className="h-4 w-4" />}
                      <span className="sr-only">更换企业logo</span>
                    </span>
                  </Button>
                </label>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <h3 className="font-medium">{selectedCompany?.name || "未选择公司"}</h3>
                  {selectedCompany?.verified && <BadgeCheckIcon className="h-5 w-5 text-blue-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{selectedCompany?.industry || "未填写行业"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">公司列表</span>
              </div>
              <div className="pl-2">
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  value={selectedCompanyId || ""}
                  onChange={(e) => setSelectedCompanyId(Number(e.target.value) || null)}
                >
                  <option value="">请选择公司</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
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
                <Label htmlFor="companyName">企业名称</Label>
                <Input
                  id="companyName"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">所属行业</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">办公地点</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">官网</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">公司简介</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">联系邮箱</Label>
                <Input
                  id="contactEmail"
                  value={form.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
