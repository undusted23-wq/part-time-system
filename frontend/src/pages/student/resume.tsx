import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, UploadIcon, EditIcon, PlusIcon, BriefcaseIcon, GraduationCapIcon, Loader2, X, Eye } from "lucide-react";
import authService from "@/services/authService";
import { PDFPreview } from "@/components/PDFPreview";

// --- 定义接口类型 (根据你的后端实体) ---
interface Education {
  id?: number;
  schoolName: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface WorkExperience {
  id?: number;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ResumeData {
  id: number;
  title?: string;
  summary?: string;
  skills?: string; // 后端存的是逗号分隔字符串
  resumeFilePath: string | null;
  student?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  educationList: Education[];
  workExperienceList: WorkExperience[];
}

export default function Resume() {
  // --- 状态管理 ---
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // 工作经历模态框状态
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [workForm, setWorkForm] = useState<WorkExperience>({
    companyName: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  // 统一编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    title: "",
    summary: "",
    skills: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = authService.getCurrentUser();
  const studentId = currentUser?.id;
  const token = localStorage.getItem('token');
  const API_BASE_URL = "http://localhost:8080/api/resumes";

  // --- 1. 获取简历数据 ---
  const fetchResume = async () => {
    try {
      setLoading(true);
      // 调用后端 "获取简历" 接口
      if (!studentId) {
        throw new Error("Missing student id");
      }
      const response = await axios.get(`${API_BASE_URL}/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // 兼容不同的后端返回结构 (ApiResponse vs 直接返回对象)
      const data = response.data.data || response.data;
      setResume(data);
    } catch (error) {
      console.error("加载简历失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  // --- 2. 文件上传 ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !resume) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_BASE_URL}/${resume.id}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("简历上传成功！");
      fetchResume(); // 刷新数据以更新路径
    } catch (error) {
      console.error("上传失败:", error);
      alert("上传失败，请检查后端服务");
    }
  };

  // --- 3. 文件下载 ---
  const handleFileDownload = async () => {
    if (!resume || !resume.resumeFilePath) {
      alert("您还没有上传过简历文件");
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/${resume.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob', // 关键: 二进制流
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = resume.student?.fullName || resume.title || "resume";
      link.setAttribute('download', `resume_${filename}_${resume.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败");
    }
  };

  // --- 4. 添加工作经历 ---
  const handleAddWorkExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;

    try {
      await axios.post(`${API_BASE_URL}/${resume.id}/work-experience`, workForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("工作经历添加成功！");
      setIsWorkModalOpen(false); // 关闭模态框
      setWorkForm({ companyName: "", position: "", startDate: "", endDate: "", description: "" }); // 重置表单
      fetchResume(); // 刷新列表
    } catch (error) {
      console.error("添加失败:", error);
      alert("添加失败");
    }
  };

  // --- 5. 统一编辑模式处理 ---
  const handleStartEdit = () => {
    if (!resume) return;
    setEditForm({
      fullName: resume.student?.fullName || "",
      email: resume.student?.email || "",
      phoneNumber: resume.student?.phoneNumber || "",
      title: resume.title || "",
      summary: resume.summary || "",
      skills: resume.skills || ""
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!resume) return;

    try {
      const updateData = {
        ...resume,
        title: editForm.title,
        summary: editForm.summary,
        skills: editForm.skills,
        student: {
          ...resume.student,
          fullName: editForm.fullName,
          email: editForm.email,
          phoneNumber: editForm.phoneNumber
        }
      };

      await axios.put(`${API_BASE_URL}/${resume.id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("保存成功！");
      setIsEditing(false);
      fetchResume();
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败");
    }
  };


  // --- 加载中状态 ---
  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">正在加载简历...</span>
      </div>
    );
  }

  // --- 如果没有数据 ---
  if (!resume) {
    return <div className="text-center p-10">未找到简历数据，请联系管理员或重新登录。</div>;
  }

  // 处理技能字符串转数组
  const skillsArray = resume.skills ? resume.skills.split(/[,，]/) : [];

  return (
    <div className="grid gap-6 relative">
      <h1 className="text-2xl font-bold">我的简历</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>个人简历</CardTitle>
              <CardDescription>完整的简历可以提高您被录用的机会</CardDescription>
            </div>
<div className="flex gap-2">
                {!isEditing ? (
                  <>
                    {/* 隐藏的文件输入框 */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                      <UploadIcon className="h-4 w-4" />
                      上传
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleFileDownload}>
                      <Download className="h-4 w-4" />
                      下载
                    </Button>
                    {resume.fileUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1" 
                        onClick={() => setShowPDFPreview(true)}
                      >
                        <Eye className="h-4 w-4" />
                        预览
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleStartEdit}>
                      <EditIcon className="h-4 w-4" />
                      编辑
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      保存
                    </Button>
                  </>
                )}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">完整度</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="grid gap-6">
            {/* --- 个人信息 --- */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">个人信息</h3>
                  <p className="text-sm text-muted-foreground">基本联系方式和个人详情</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-muted-foreground">姓名</span>
                  {isEditing ? (
                    <Input
                      className="col-span-2"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  ) : (
                    <span className="col-span-2 font-medium">{resume.student?.fullName || "未填写"}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-muted-foreground">邮箱</span>
                  {isEditing ? (
                    <Input
                      type="email"
                      className="col-span-2"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  ) : (
                    <span className="col-span-2">{resume.student?.email || "未填写"}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <span className="text-muted-foreground">电话</span>
                  {isEditing ? (
                    <Input
                      className="col-span-2"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  ) : (
                    <span className="col-span-2">{resume.student?.phoneNumber || "未填写"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* --- 教育经历 (动态渲染) --- */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">教育经历</h3>
                  <p className="text-sm text-muted-foreground">您的教育背景</p>
                </div>
                {/* 这里的编辑按钮目前仅作为展示，后续可添加类似工作经历的Modal */}
                <Button variant="ghost" size="icon"><EditIcon className="h-4 w-4" /></Button>
              </div>
              <div className="grid gap-4">
                {resume.educationList && resume.educationList.length > 0 ? (
                  resume.educationList.map((edu, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1"><GraduationCapIcon className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <h4 className="font-medium">{edu.schoolName}</h4>
                        <p className="text-sm">{edu.major} | {edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无教育经历</p>
                )}
              </div>
            </div>

            {/* --- 工作经历 (动态渲染) --- */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">工作经历</h3>
                  <p className="text-sm text-muted-foreground">您的职业历程</p>
                </div>
              </div>
              <div className="grid gap-4">
                {resume.workExperienceList && resume.workExperienceList.length > 0 ? (
                  resume.workExperienceList.map((work, index) => (
                    <div key={index} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                      <div className="mt-1"><BriefcaseIcon className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <h4 className="font-medium">{work.companyName}</h4>
                        <p className="text-sm font-semibold">{work.position}</p>
                        <p className="text-sm text-muted-foreground">{work.startDate} - {work.endDate}</p>
                        <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无工作经历</p>
                )}
              </div>
            </div>


            {/* --- 简历信息和技能 --- */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">简历信息</h3>
                  <p className="text-sm text-muted-foreground">简历标题、个人简介和技能</p>
                </div>
              </div>
              <div className="grid gap-4 text-sm">
                {/* 简历标题 */}
                <div>
                  <label className="text-muted-foreground block mb-1">简历标题</label>
                  {isEditing ? (
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="例如: 资深前端工程师"
                    />
                  ) : (
                    <p className="font-medium">{resume.title || "未填写"}</p>
                  )}
                </div>

                {/* 个人简介 */}
                <div>
                  <label className="text-muted-foreground block mb-1">个人简介</label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.summary}
                      onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                      placeholder="简要介绍您的经验和专长..."
                      className="min-h-[80px]"
                    />
                  ) : (
                    <p>{resume.summary || "未填写"}</p>
                  )}
                </div>

                {/* 技能 */}
                <div>
                  <label className="text-muted-foreground block mb-1">技能 {isEditing && <span className="text-xs">(逗号分隔)</span>}</label>
                  {isEditing ? (
                    <Input
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      placeholder="例如: React, Vue, TypeScript"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.length > 0 ? skillsArray.map((skill, i) => (
                        <span key={i} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {skill.trim()}
                        </span>
                      )) : <span className="text-muted-foreground">暂无技能标签</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- 添加工作经历按钮 --- */}
            <div className="border rounded-lg p-4 border-dashed flex flex-col items-center justify-center py-6">
              <Button variant="outline" className="gap-1" onClick={() => setIsWorkModalOpen(true)}>
                <PlusIcon className="h-4 w-4" />
                添加工作经历
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- 手写简单 Modal (添加工作经历) --- */}
      {isWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">添加工作经历</h3>
              <button onClick={() => setIsWorkModalOpen(false)} className="text-gray-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWorkExperience} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">公司名称</label>
                <input
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={workForm.companyName}
                  onChange={(e) => setWorkForm({ ...workForm, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">职位</label>
                <input
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={workForm.position}
                  onChange={(e) => setWorkForm({ ...workForm, position: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">开始日期</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={workForm.startDate}
                    onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结束日期</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={workForm.endDate}
                    onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">工作描述</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                  value={workForm.description}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsWorkModalOpen(false)}>取消</Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PDF预览模态框 --- */}
      {showPDFPreview && resume?.fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">PDF预览 - {resume.student?.fullName}</h3>
              <button 
                onClick={() => setShowPDFPreview(false)} 
                className="text-gray-500 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(90vh-120px)]">
              <PDFPreview 
                fileUrl={resume.fileUrl} 
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
