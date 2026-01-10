import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EyeIcon, SearchIcon, DownloadIcon, Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import resumeService, { Resume } from "@/services/resumeService";

export default function ResumeManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await resumeService.getAllResumes();
      setResumes(data);
    } catch (error: any) {
      console.error("Failed to load resumes:", error);
      setErrorMessage(error.response?.data?.message || "无法加载简历列表，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  // Calculate resume completeness based on filled fields
  const calculateCompleteness = (resume: Resume): number => {
    let filledFields = 0;
    let totalFields = 8;

    if (resume.title) filledFields++;
    if (resume.summary) filledFields++;
    if (resume.skills) filledFields++;
    if (resume.resumeFilePath) filledFields++;
    if (resume.student?.fullName) filledFields++;
    if (resume.student?.email) filledFields++;
    if (resume.educationList && resume.educationList.length > 0) filledFields++;
    if (resume.workExperienceList && resume.workExperienceList.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  // Handle view resume
  const handleViewResume = async (id: number) => {
    try {
      setErrorMessage(null);
      const resume = await resumeService.getResumeById(id);
      // You can implement a modal to show resume details
      console.log("Resume details:", resume);
      setSuccessMessage(`查看简历 ID: ${id}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to view resume:", error);
      setErrorMessage(error.response?.data?.message || "无法查看简历");
    }
  };

  // Handle download resume
  const handleDownloadResume = async (id: number, fileName?: string) => {
    try {
      setErrorMessage(null);
      const blob = await resumeService.downloadResume(id);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `resume_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("简历已下载到本地");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to download resume:", error);
      setErrorMessage(error.response?.data?.message || "无法下载简历文件");
    }
  };

  // Handle delete resume
  const handleDeleteResume = async (id: number) => {
    if (!confirm("确定要删除这份简历吗？此操作不可撤销。")) {
      return;
    }

    try {
      setErrorMessage(null);
      await resumeService.deleteResume(id);
      setSuccessMessage("简历已被删除");
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh the list
      fetchResumes();
    } catch (error: any) {
      console.error("Failed to delete resume:", error);
      setErrorMessage(error.response?.data?.message || "无法删除简历");
    }
  };

  // Filter resumes based on search query
  const filteredResumes = resumes.filter(resume => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const studentName = resume.student?.fullName?.toLowerCase() || "";
    const studentId = resume.student?.id?.toString() || "";
    const title = resume.title?.toLowerCase() || "";

    return studentName.includes(query) ||
      studentId.includes(query) ||
      title.includes(query);
  });

  // Calculate statistics
  const totalResumes = resumes.length;
  const avgCompleteness = resumes.length > 0
    ? Math.round(resumes.reduce((sum, r) => sum + calculateCompleteness(r), 0) / resumes.length)
    : 0;

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">学生简历管理</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索学生姓名、学号或简历标题..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchResumes} variant="outline">
          刷新列表
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>简历列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">学号</th>
                      <th className="p-2 text-left font-medium">学生姓名</th>
                      <th className="p-2 text-left font-medium">简历标题</th>
                      <th className="p-2 text-left font-medium">技能</th>
                      <th className="p-2 text-left font-medium">完整度</th>
                      <th className="p-2 text-left font-medium">更新时间</th>
                      <th className="p-2 text-left font-medium">状态</th>
                      <th className="p-2 text-center font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResumes.map((resume) => {
                      const completeness = calculateCompleteness(resume);
                      return (
                        <tr key={resume.id} className="border-b">
                          <td className="p-2">{resume.student?.id || "-"}</td>
                          <td className="p-2">{resume.student?.fullName || "-"}</td>
                          <td className="p-2">{resume.title || "未命名"}</td>
                          <td className="p-2">
                            <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block">
                              {resume.skills || "-"}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full max-w-[100px] rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full ${completeness >= 80 ? "bg-green-500" :
                                      completeness >= 50 ? "bg-yellow-500" :
                                        "bg-red-500"
                                    }`}
                                  style={{ width: `${completeness}%` }}
                                />
                              </div>
                              <span>{completeness}%</span>
                            </div>
                          </td>
                          <td className="p-2">
                            {resume.updatedAt
                              ? new Date(resume.updatedAt).toLocaleDateString('zh-CN')
                              : "-"}
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${resume.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}>
                              {resume.active ? "启用" : "禁用"}
                            </span>
                            {resume.default && (
                              <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                默认
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewResume(resume.id!)}
                                title="查看详情"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">查看</span>
                              </Button>
                              {resume.resumeFilePath && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDownloadResume(resume.id!, resume.resumeFilePath)}
                                  title="下载简历文件"
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                  <span className="sr-only">下载</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteResume(resume.id!)}
                                title="删除简历"
                              >
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">删除</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredResumes.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-center text-muted-foreground">
                    {searchQuery ? "没有找到符合条件的简历" : "暂无简历数据"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  显示 {filteredResumes.length} 条记录，共 {resumes.length} 条
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>简历统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">总简历数</span>
              <span className="text-3xl font-bold mt-2">{totalResumes}</span>
              <span className="text-sm text-muted-foreground mt-1">系统中的简历总数</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">启用的简历</span>
              <span className="text-3xl font-bold mt-2 text-green-600">
                {resumes.filter(r => r.active).length}
              </span>
              <span className="text-sm text-muted-foreground mt-1">当前活跃状态</span>
            </div>
            <div className="flex flex-col p-4 border rounded-lg">
              <span className="text-sm text-muted-foreground">简历平均完整度</span>
              <span className="text-3xl font-bold mt-2">{avgCompleteness}%</span>
              <span className="text-sm text-muted-foreground mt-1">所有简历的平均完整度</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
