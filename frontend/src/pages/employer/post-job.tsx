import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jobService from "@/services/jobService";
import companyService, { Company } from "@/services/companyService";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date>();
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
        toast.error("加载公司列表失败，请稍后再试。");
      }
    };

    loadCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobData.companyId) {
      toast.error("请先选择所属公司。");
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
        applicationDeadline: deadlineDate ? deadlineDate.toISOString() : undefined
      });
      toast.success("职位发布成功！");
      // Navigate to jobs list after successful creation
      navigate("/employer/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("发布失败，请稍后再试。");
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
                <Select value={jobData.companyId} onValueChange={(value) => handleSelectChange("companyId", value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择公司" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id?.toString() || ""}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={jobData.jobType} onValueChange={(value) => handleSelectChange("jobType", value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PART_TIME">兼职</SelectItem>
                    <SelectItem value="INTERNSHIP">实习</SelectItem>
                    <SelectItem value="FULL_TIME">全职</SelectItem>
                    <SelectItem value="TEMPORARY">临时工</SelectItem>
                    <SelectItem value="CONTRACT">合同工</SelectItem>
                    <SelectItem value="FREELANCE">自由职业</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={jobData.salaryPeriod} onValueChange={(value) => handleSelectChange("salaryPeriod", value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">小时</SelectItem>
                    <SelectItem value="DAILY">天</SelectItem>
                    <SelectItem value="WEEKLY">周</SelectItem>
                    <SelectItem value="MONTHLY">月</SelectItem>
                    <SelectItem value="ANNUALLY">年</SelectItem>
                    <SelectItem value="PROJECT_BASED">项目</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>截止日期</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadlineDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadlineDate ? format(deadlineDate, "PPP") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadlineDate}
                      onSelect={setDeadlineDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              <Textarea
                id="description"
                name="description"
                rows={5}
                value={jobData.description}
                onChange={handleChange}
                placeholder="详细描述该职位的工作内容、职责等"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">任职要求</Label>
              <Textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={jobData.requirements}
                onChange={handleChange}
                placeholder="列出该职位所需的技能、经验、教育背景等要求"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">福利待遇</Label>
              <Textarea
                id="benefits"
                name="benefits"
                rows={3}
                value={jobData.benefits}
                onChange={handleChange}
                placeholder="如：餐补、交通补贴、弹性时间"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "发布中..." : "发布职位"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
