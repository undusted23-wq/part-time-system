# 兼职系统平台

一个全栈兼职招聘平台，支持学生、雇主、管理员和访客多种角色，提供职位搜索、智能推荐、简历管理、申请跟踪等完整功能。

## 🚀 项目特色

- **多角色支持**: 学生、雇主、管理员、访客四种用户角色
- **智能推荐**: AI驱动的职位匹配和推荐系统
- **现代化界面**: React + TypeScript + Tailwind CSS
- **完整功能**: 简历管理、职位发布、申请跟踪、消息系统
- **响应式设计**: 适配桌面端和移动端

## 📋 技术栈

### 前端 (frontend/)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: Tailwind CSS + Radix UI
- **路由**: React Router v7
- **状态管理**: React Hooks
- **表单处理**: React Hook Form + Zod验证
- **图表**: Recharts
- **图标**: Lucide React

### 后端 (backend/)
- **框架**: Spring Boot
- **语言**: Java
- **安全**: Spring Security + JWT认证
- **数据存储**: 支持多种数据库配置
- **API文档**: RESTful API

## 🏗️ 项目结构

```
part-time-system/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/ui/   # 基础UI组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── admin/       # 管理员页面
│   │   │   ├── employer/    # 雇主页面
│   │   │   ├── student/     # 学生页面
│   │   │   └── visitor/     # 访客页面
│   │   ├── services/        # API服务
│   │   └── types/           # TypeScript类型定义
│   └── package.json
├── backend/                  # Spring Boot后端
│   └── src/main/java/
│       └── com/example/backend/
│           ├── controller/  # REST控制器
│           ├── service/     # 业务逻辑层
│           ├── model/       # 数据模型
│           ├── dto/         # 数据传输对象
│           ├── repository/  # 数据访问层
│           └── security/    # 安全配置
└── README.md
```

## 🛠️ 开发环境配置

### 环境要求
- Node.js 18+
- Java 11+
- Maven 3.6+
- Bun (推荐) 或 npm

### 前端依赖安装
```bash
cd frontend
bun install
```

### 后端依赖安装
```bash
cd backend
./mvnw clean install
```

## 🚀 快速开始

### 1. 启动后端服务
```bash
cd backend
./mvnw spring:run
```
后端服务将运行在 `http://localhost:8080`

### 2. 启动前端开发服务器
```bash
cd frontend
bun run dev
```
前端服务将运行在 `http://localhost:5173`

### 3. 生产环境构建

**前端构建**:
```bash
cd frontend
bun run build
```

**后端打包**:
```bash
cd backend
./mvnw clean package
```

## 👥 用户角色与功能

### 学生用户 (Student)
- 📄 **简历管理**: 创建、编辑个人简历
- 🔍 **职位搜索**: 智能搜索和筛选兼职职位
- 💾 **收藏管理**: 保存感兴趣的职位
- 📝 **申请跟踪**: 查看申请状态和进度
- 💬 **消息系统**: 与雇主沟通交流
- ⭐ **评价系统**: 对工作经历进行评价
- 🤖 **AI助手**: 智能求职建议和推荐

### 雇主用户 (Employer)
- 📢 **职位发布**: 创建和管理兼职职位
- 👥 **候选人管理**: 查看学生申请和简历
- 📊 **数据统计**: 职位浏览量、申请量分析
- 💬 **消息沟通**: 与求职者即时交流
- ⭐ **评价管理**: 管理学生对职位的评价
- ⚙️ **账户设置**: 企业信息和偏好设置

### 管理员 (Admin)
- 🏢 **企业管理**: 审核和管理企业账户
- 📋 **职位监管**: 审核职位信息和内容
- 👥 **用户管理**: 管理学生和雇主账户
- 💬 **消息监控**: 平台消息内容管理
- ⭐ **评价审核**: 管理平台评价内容
- 📊 **系统统计**: 平台整体数据统计

### 访客用户 (Visitor)
- 🏠 **首页浏览**: 查看平台概览和推荐
- 🔍 **职位浏览**: 浏览公开的职位信息
- 🏢 **企业展示**: 查看入驻企业信息
- ⭐ **评价查看**: 浏览平台评价内容

## 🔧 核心功能详解

### 1. 智能推荐系统
- 基于用户行为和偏好的AI推荐算法
- 个性化职位匹配
- 相似用户推荐

### 2. 简历管理系统
- 多版本简历支持
- 在线编辑和预览
- 模板库和自定义模板

### 3. 申请跟踪系统
- 实时申请状态更新
- 进度通知和提醒
- 批量操作功能

### 4. 消息通讯系统
- 即时消息功能
- 文件传输支持
- 消息历史记录

### 5. 评价系统
- 双向评价机制
- 信誉积分系统
- 评价内容审核

## 📱 API接口文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 用户管理
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/resumes` - 获取简历列表

### 职位管理
- `GET /api/jobs` - 获取职位列表
- `POST /api/jobs` - 创建职位
- `GET /api/jobs/{id}` - 获取职位详情
- `PUT /api/jobs/{id}` - 更新职位信息

### 申请管理
- `GET /api/applications` - 获取申请列表
- `POST /api/applications` - 提交申请
- `PUT /api/applications/{id}` - 更新申请状态

### 推荐系统
- `GET /api/recommendations` - 获取推荐职位

## 🔒 安全特性

- JWT令牌认证
- 密码加密存储
- API接口权限控制
- 输入数据验证和过滤
- CORS跨域保护

## 🧪 测试

### 后端测试
```bash
cd backend
./mvnw test
```

### 前端测试
目前暂未配置前端测试框架，计划添加 Jest + Testing Library

## 📦 部署

### Docker部署 (推荐)
```bash
# 构建并启动所有服务
docker-compose up --build
```

### 传统部署
1. 构建前端应用: `cd frontend && bun run build`
2. 部署静态文件到Web服务器
3. 部署后端JAR文件到应用服务器
4. 配置反向代理和负载均衡

## 🤝 开发规范

### 代码风格
- 前端: 2空格缩进，TypeScript + React
- 后端: 4空格缩进，Java Spring Boot
- Python: snake_case命名规范

### Git提交规范
- 使用简洁的中文或英文提交信息
- 格式: `类型: 简短描述`
- 示例: `feat: 添加职位搜索功能`

### PR流程
1. Fork项目并创建feature分支
2. 完成功能开发和测试
3. 提交PR并描述变更内容
4. 代码审核通过后合并

## 📝 更新日志

### v0.1.0 (当前版本)
- ✅ 基础用户认证系统
- ✅ 多角色权限管理
- ✅ 简历管理系统
- ✅ 职位发布和搜索
- ✅ 申请跟踪功能
- ✅ 消息通讯系统
- ✅ 评价系统
- ✅ AI推荐功能
- ✅ 管理员后台

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

1. Fork本项目
2. 创建特性分支: `git checkout -b feature/新功能`
3. 提交变更: `git commit -am '添加新功能'`
4. 推送分支: `git push origin feature/新功能`
5. 提交Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/anomalyco/opencode/issues)
- 发送邮件至: support@example.com
- 项目主页: https://github.com/anomalyco/opencode

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！