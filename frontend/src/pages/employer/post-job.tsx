import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jobService from "@/services/jobService";
import companyService, { Company } from "@/services/companyService";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    location: "",
    jobType: "PART_TIME",
    salary: "",
    salaryPeriod: "HOURLY",
    description: "",
    requirements: "",
    benefits: "",
    workingHours: "",
    applicationDeadline: "",
    companyId: ""
  });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await companyService.getEmployerCompanies();
        setCompanies(Array.isArray(data) ? data : []);
        if (data?.length) {
          setJobData((prev) => ({ ...prev, companyId: data[0].id?.toString() || "" }));
        }
      } catch (error) {
        console.error("Failed to load companies:", error);
        alert("加载公司列表失败，请稍后再试。");
      }
    };

    loadCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobData.companyId) {
      alert("请先选择所属公司。");
      return;
    }

    setLoading(true);
    try {
      await jobService.createJob({
        title: jobData.title,
        description: jobData.description,
        jobType: jobData.jobType,
        location: jobData.location || undefined,
        salary: Number(jobData.salary),
        salaryPeriod: jobData.salaryPeriod,
        requirements: jobData.requirements || undefined,
        benefits: jobData.benefits || undefined,
        workingHours: jobData.workingHours || undefined,
        companyId: Number(jobData.companyId),
        applicationDeadline: jobData.applicationDeadline
          ? new Date(jobData.applicationDeadline).toISOString()
          : undefined
      });
      alert("职位发布成功！");
      // Navigate to jobs list after successful creation
      navigate("/employer/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      alert("发布失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">发布新职位</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>职位信息</CardTitle>
            <CardDescription>填写您要发布的职位详细信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">所属公司 <span className="text-red-500">*</span></Label>
                <select
                  id="companyId"
                  name="companyId"
                  value={jobData.companyId}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">请选择公司</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">职位名称 <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  placeholder="如：市场推广专员"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">工作地点</Label>
                <Input
                  id="location"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="如：北京市海淀区"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">工作类型 <span className="text-red-500">*</span></Label>
                <select
                  id="jobType"
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="PART_TIME">兼职</option>
                  <option value="INTERNSHIP">实习</option>
                  <option value="FULL_TIME">全职</option>
                  <option value="TEMPORARY">临时工</option>
                  <option value="CONTRACT">合同工</option>
                  <option value="FREELANCE">自由职业</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">薪资 <span className="text-red-500">*</span></Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={jobData.salary}
                  onChange={handleChange}
                  placeholder="如：30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">薪资周期 <span className="text-red-500">*</span></Label>
                <select
                  id="salaryPeriod"
                  name="salaryPeriod"
                  value={jobData.salaryPeriod}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="HOURLY">小时</option>
                  <option value="DAILY">天</option>
                  <option value="WEEKLY">周</option>
                  <option value="MONTHLY">月</option>
                  <option value="ANNUALLY">年</option>
                  <option value="PROJECT_BASED">项目</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">截止日期</Label>
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="datetime-local"
                  value={jobData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHours">工作时长</Label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  value={jobData.workingHours}
                  onChange={handleChange}
                  placeholder="如：每周3天，每天4小时"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">职位描述 <span className="text-red-500">*</span></Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={jobData.description}
                onChange={handleChange}
                placeholder="详细描述该职位的工作内容、职责等"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">任职要求</Label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={jobData.requirements}
                onChange={handleChange}
                placeholder="列出该职位所需的技能、经验、教育背景等要求"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">福利待遇</Label>
              <textarea
                id="benefits"
                name="benefits"
                rows={3}
                value={jobData.benefits}
                onChange={handleChange}
                placeholder="如：餐补、交通补贴、弹性时间"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/employer/jobs")}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "发布中..." : "发布职位"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
