import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BookmarkIcon, 
  EyeIcon, 
  FileTextIcon, 
  SearchIcon, 
  StarIcon, 
  UserIcon 
} from "lucide-react";
import { useState } from "react";

export default function EmployerFavorites() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // 模拟过滤功能 - 实际应用中应该从后端API获取过滤后的数据
  const filteredResumes = resumes.filter(resume => {
    // 类别筛选
    if (categoryFilter !== "all" && resume.categories.indexOf(categoryFilter) === -1) {
      return false;
    }
    
    // 搜索查询
    if (searchQuery && !resume.name.includes(searchQuery) && 
        !resume.school.includes(searchQuery) && 
        !resume.major.includes(searchQuery)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的人才库</h1>
      </div>
      
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="搜索姓名、学校或专业..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 py-1"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">所有分类</option>
          <option value="技术开发">技术开发</option>
          <option value="设计">设计</option>
          <option value="市场营销">市场营销</option>
          <option value="运营">运营</option>
          <option value="客服">客服</option>
        </select>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResumes.map((resume) => (
          <Card key={resume.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{resume.name}</h3>
                      <p className="text-sm text-muted-foreground">{resume.school} · {resume.major}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= resume.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-1">
                    <BookmarkIcon className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">
                      收藏分类: 
                      <span className="text-blue-500 ml-1">{resume.categories.join(', ')}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">求职意向: </span>
                    {resume.jobIntention}
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">备注: </span>
                    {resume.note}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    收藏于 {resume.savedAt}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <FileTextIcon className="h-4 w-4" />
                      查看简历
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <EyeIcon className="h-4 w-4" />
                      查看详情
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredResumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10">
          <BookmarkIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">没有找到符合条件的收藏简历</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          显示 {filteredResumes.length} 条记录，共 {resumes.length} 条
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">下一页</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>分类管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="新增分类名称" className="max-w-xs" />
              <Button>添加分类</Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">已有分类</h3>
              <div className="flex flex-wrap gap-2">
                {['技术开发', '设计', '市场营销', '运营', '客服'].map((category) => (
                  <div 
                    key={category}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    <span>{category}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-blue-200">
                      <span className="sr-only">删除</span>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 模拟数据 - 实际应用中应该从API获取
const resumes = [
  {
    id: 1,
    name: "李明",
    school: "山西大学",
    major: "计算机科学与技术",
    skills: ["Java", "Spring Boot", "MySQL", "Redis", "React"],
    jobIntention: "后端开发实习生",
    savedAt: "2025-04-10",
    rating: 5,
    categories: ["技术开发"],
    note: "算法能力强，有开源项目经验，潜力很大"
  },
  {
    id: 2,
    name: "王芳",
    school: "清华大学",
    major: "软件工程",
    skills: ["Python", "Django", "数据分析", "机器学习"],
    jobIntention: "数据分析师",
    savedAt: "2025-04-09",
    rating: 4,
    categories: ["技术开发", "运营"],
    note: "数学基础好，有数据建模竞赛经验"
  },
  {
    id: 3,
    name: "张伟",
    school: "中国人民大学",
    major: "市场营销",
    skills: ["社交媒体运营", "内容创作", "用户增长", "数据分析"],
    jobIntention: "市场营销实习生",
    savedAt: "2025-04-08",
    rating: 3,
    categories: ["市场营销"],
    note: "表达能力强，有校园活动组织经验"
  },
  {
    id: 4,
    name: "刘洋",
    school: "北京师范大学",
    major: "视觉传达设计",
    skills: ["UI设计", "平面设计", "Figma", "Photoshop", "Illustrator"],
    jobIntention: "UI设计师",
    savedAt: "2025-04-07",
    rating: 5,
    categories: ["设计"],
    note: "作品集很优秀，有多个APP界面设计经验"
  },
  {
    id: 5,
    name: "赵敏",
    school: "北京航空航天大学",
    major: "人力资源管理",
    skills: ["人员招聘", "培训", "绩效管理", "Excel", "PowerPoint"],
    jobIntention: "HR助理",
    savedAt: "2025-04-06",
    rating: 4,
    categories: ["运营"],
    note: "沟通能力强，有校园招聘活动组织经验"
  },
  {
    id: 6,
    name: "孙宇",
    school: "北京科技大学",
    major: "电子商务",
    skills: ["客户服务", "问题解决", "沟通协调", "CRM系统"],
    jobIntention: "客服专员",
    savedAt: "2025-04-05",
    rating: 3,
    categories: ["客服"],
    note: "有耐心，英语口语不错"
  }
];
