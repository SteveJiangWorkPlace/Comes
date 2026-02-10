# Comes Frontend

基于 Otium_wip 项目 UI 设计的前端应用，采用现代 React 技术栈。

## 技术栈

- **前端框架**: React 19 + TypeScript 5.x
- **构建工具**: Vite 5.x
- **路由管理**: React Router DOM 7.x
- **状态管理**: Zustand 5.x (带持久化中间件)
- **UI组件**: Ant Design 6.x + Ant Design Icons
- **HTTP客户端**: Axios 1.x
- **样式方案**: CSS Modules + CSS 变量设计系统
- **代码质量**: ESLint + Prettier + TypeScript 严格模式

## 项目结构

```
src/
├── api/              # API 客户端配置和端点定义
├── components/       # 可复用组件库
│   ├── layout/      # 布局组件 (AppLayout, Sidebar)
│   └── ui/          # 基础UI组件 (Button, Card, Input等)
├── hooks/           # 自定义React Hooks
├── pages/           # 页面组件
│   ├── Login/       # 登录页面
│   ├── Module1/     # 模块1占位符
│   ├── Module2/     # 模块2占位符
│   ├── Module3/     # 模块3占位符
│   ├── Admin/       # 管理员页面
│   └── NotFound/    # 404页面
├── store/           # Zustand状态管理
├── styles/          # 样式系统 (CSS变量、全局样式)
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── router/          # 路由配置
├── App.tsx          # 根组件
└── main.tsx         # 应用入口
```

## 快速开始

### 环境设置

1. 复制环境变量模板：
   ```bash
   cp .env.example .env.local
   ```
2. 根据需要编辑 `.env.local` 文件

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动，支持热重载。

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 预览构建版本

```bash
npm run preview
```

### 代码质量检查

```bash
npm run lint          # ESLint 检查
npm run type-check    # TypeScript 类型检查
npm run format        # Prettier 格式化代码
npm run validate      # 运行类型检查和Lint
```

## 设计系统

项目使用基于 CSS 变量的设计系统，参考 Otium_wip 的黑白主题：

- **主色调**: 黑色 (`#110D0C`)
- **背景色**: 白色 (`#FFFFFF`)
- **字体系统**: 完整的字体层次和间距变量
- **组件变量**: 侧边栏、按钮、卡片等专用颜色变量

CSS 变量定义在 `src/styles/design-system/` 目录中。

## 功能特性

### 认证系统

- 登录/登出功能
- 路由保护 (PrivateRoute, AdminRoute)
- 本地持久化 token 管理
- 用户角色权限控制

### 侧边栏导航

- 可折叠设计
- 3个模块菜单 + 管理员菜单
- 用户信息显示区域
- API 密钥管理入口
- 键盘导航支持

### 模块页面

- 模块1: 文本输入和结果展示
- 模块2: 数据分析和可视化占位符
- 模块3: 文档编辑和管理占位符
- 管理员面板: 系统管理和监控

### 响应式设计

- 适应不同屏幕尺寸
- 移动端友好的侧边栏
- 自适应布局

## 部署

### Netlify 前端部署

1. 连接 GitHub 仓库到 Netlify
2. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 设置环境变量：
   - `VITE_API_BASE_URL`: 后端 API 地址 (Render 部署的 URL)
4. 部署自动触发于主分支推送

Netlify 配置见 `netlify.toml`。

### Render 后端部署

后端为占位符结构，部署配置见 `backend/render.yaml`。

1. 在 Render 创建 Web Service
2. 连接后端目录 (`backend/`)
3. 配置环境变量和启动命令
4. 设置健康检查端点

### 环境变量管理

- `.env.example`: 环境变量模板 (提交到版本控制)
- `.env.local`: 本地开发环境变量 (添加到 `.gitignore`)
- Netlify/Render UI: 生产环境变量配置

**重要**: 敏感信息 (API密钥、数据库密码) 必须通过环境变量配置，绝不硬编码。

## 开发指南

### 添加新模块

1. 创建页面组件: `src/pages/ModuleX/ModuleX.tsx`
2. 添加路由配置: `src/router/routes.tsx`
3. 创建状态管理: `src/store/moduleX.store.ts` (可选)
4. 添加侧边栏菜单项: `src/components/layout/Sidebar/Sidebar.tsx`
5. 更新类型定义: `src/types/module.types.ts`

### 组件开发规范

- 使用 TypeScript 定义完整 Props 接口
- 使用 CSS Modules 进行样式隔离
- 遵循单一职责原则
- 提供适当的默认值和文档注释

### 状态管理

- 全局状态使用 `auth.store.ts`
- 模块状态使用独立的 store 文件
- 使用 Zustand 选择器派生计算状态
- 重要状态配置持久化

### API 集成

- 使用 `src/api/client.ts` 的 axios 实例
- 统一错误处理格式
- 请求/响应拦截器处理 token 注入
- TypeScript 类型安全的 API 定义

## 故障排除

### 常见问题

1. **开发服务器无法启动**
   - 检查端口 3000 是否被占用
   - 确保所有依赖已正确安装
   - 检查 TypeScript 编译错误

2. **热重载不工作**
   - 确保文件保存在正确的目录
   - 检查 Vite 配置中的 watch 选项
   - 清除浏览器缓存

3. **构建失败**
   - 检查 TypeScript 类型错误
   - 确保环境变量正确设置
   - 验证所有导入路径正确

4. **样式不生效**
   - 检查 CSS Modules 类名引用
   - 验证 CSS 变量导入顺序
   - 检查浏览器开发者工具中的样式应用

### 调试工具

- **React DevTools**: 组件层次和状态检查
- **Zustand DevTools**: 状态管理调试
- **浏览器开发者工具**: 网络请求和样式调试
- **Vite 错误覆盖层**: 实时编译错误显示

## 许可证

本项目为内部开发项目，版权所有。
