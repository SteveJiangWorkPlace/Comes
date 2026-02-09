# Comes项目开发计划

## 上下文
在C:\Users\alexa\Documents\GitHub目录下创建一个名为"Comes"的新项目文件夹，基于Otium_wip项目的UI设计进行前端开发。项目将参考Otium_wip的登录界面、侧边栏设计、主题色配置、模块视觉和交互模式，但功能命名和模块命名先空着，后端代码先空着，侧边栏模块命名待定。用户将先开发3个模块，因此需要创建3个模块的占位符页面。

**用户澄清后的要求：**
- 技术栈：由我根据最佳实践选择（将使用与Otium_wip相似的现代React技术栈）
- 项目结构：使用最合理的结构（参考Otium_wip的清晰分层结构）
- 模块内容：基本布局占位符（包含类似Otium_wip的卡片布局，内容区域为空）
- 文件复制：参考设计重新实现（不直接复制文件，而是参考设计重新编写代码）

## 技术栈选择
基于Otium_wip的成功实践和现代Web开发最佳实践，选择以下技术栈：
- **前端框架**: React 19 + TypeScript 5.x
- **构建工具**: Vite 5.x（比Create React App更现代快速）
- **路由管理**: React Router DOM 7.x
- **状态管理**: Zustand 5.x（轻量级，带持久化中间件）
- **UI组件**: Ant Design 6.x + Ant Design Icons
- **HTTP客户端**: Axios 1.x
- **样式方案**: CSS Modules + CSS变量设计系统
- **代码质量**: ESLint + Prettier + TypeScript严格模式
- **开发工具**: React DevTools, Zustand DevTools

**选择理由**：
- Vite提供更快的开发和构建体验
- Ant Design提供丰富的企业级UI组件，与Otium_wip使用的组件库一致
- Zustand相比Redux更轻量简单，与Otium_wip选择一致
- TypeScript确保类型安全，便于后续功能开发

## 项目结构

```
Comes/
├── frontend/                    # 前端项目根目录
│   ├── public/                 # 静态资源
│   │   ├── index.html          # HTML模板
│   │   ├── vite.svg            # 占位logo
│   │   └── logopic.svg         # 项目logo（占位符）
│   ├── src/
│   │   ├── api/               # API客户端配置
│   │   │   ├── client.ts      # Axios实例和拦截器
│   │   │   ├── endpoints.ts   # API端点定义（占位符）
│   │   │   └── types.ts       # API相关类型定义
│   │   ├── components/        # 可复用组件库
│   │   │   ├── layout/        # 布局组件
│   │   │   │   ├── AppLayout/
│   │   │   │   │   ├── AppLayout.tsx
│   │   │   │   │   └── AppLayout.module.css
│   │   │   │   └── Sidebar/
│   │   │   │       ├── Sidebar.tsx
│   │   │   │       ├── SidebarItem.tsx
│   │   │   │       └── Sidebar.module.css
│   │   │   └── ui/           # 基础UI组件（参考Ant Design但自定义）
│   │   │       ├── Button/
│   │   │       ├── Card/
│   │   │       ├── Input/
│   │   │       ├── Textarea/
│   │   │       ├── Icon/
│   │   │       └── index.ts   # 组件统一导出
│   │   ├── hooks/            # 自定义React Hooks
│   │   │   ├── useAuth.ts    # 认证相关hook
│   │   │   ├── useApiKeys.ts # API密钥管理hook
│   │   │   └── index.ts      # hooks导出
│   │   ├── pages/            # 页面组件
│   │   │   ├── Login/        # 登录页面
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Login.module.css
│   │   │   ├── Module1/      # 模块1（占位符）
│   │   │   │   ├── Module1.tsx
│   │   │   │   └── Module1.module.css
│   │   │   ├── Module2/      # 模块2（占位符）
│   │   │   │   ├── Module2.tsx
│   │   │   │   └── Module2.module.css
│   │   │   ├── Module3/      # 模块3（占位符）
│   │   │   │   ├── Module3.tsx
│   │   │   │   └── Module3.module.css
│   │   │   ├── Admin/        # 管理员页面
│   │   │   │   ├── Admin.tsx
│   │   │   │   └── Admin.module.css
│   │   │   └── NotFound/     # 404页面
│   │   │       ├── NotFound.tsx
│   │   │       └── NotFound.module.css
│   │   ├── store/            # Zustand状态管理
│   │   │   ├── auth.store.ts # 认证状态
│   │   │   ├── module1.store.ts # 模块1状态（占位符）
│   │   │   ├── module2.store.ts # 模块2状态（占位符）
│   │   │   ├── module3.store.ts # 模块3状态（占位符）
│   │   │   └── index.ts      # store导出
│   │   ├── styles/           # 样式系统
│   │   │   ├── design-system/
│   │   │   │   ├── colors.css    # 颜色变量（参考Otium_wip黑白主题）
│   │   │   │   ├── typography.css # 字体变量
│   │   │   │   ├── spacing.css   # 间距变量
│   │   │   │   └── shadows.css   # 阴影变量
│   │   │   ├── globals/      # 全局样式
│   │   │   │   ├── reset.css    # 样式重置
│   │   │   │   └── base.css     # 基础样式
│   │   │   └── utils/        # 工具类
│   │   │       └── mixins.css  # CSS混合
│   │   ├── types/            # TypeScript类型定义
│   │   │   ├── auth.types.ts # 认证相关类型
│   │   │   ├── module.types.ts # 模块相关类型
│   │   │   ├── api.types.ts  # API相关类型
│   │   │   └── index.ts      # 类型统一导出
│   │   ├── utils/            # 工具函数
│   │   │   ├── validation.ts # 验证工具
│   │   │   ├── format.ts     # 格式化工具
│   │   │   └── storage.ts    # 本地存储工具
│   │   ├── router/           # 路由配置
│   │   │   ├── routes.tsx    # 路由定义
│   │   │   ├── PrivateRoute.tsx # 私有路由组件
│   │   │   └── AdminRoute.tsx   # 管理员路由组件
│   │   ├── App.tsx           # 根组件
│   │   ├── App.css
│   │   ├── main.tsx          # 应用入口
│   │   └── vite-env.d.ts     # Vite环境类型
│   ├── index.html            # Vite入口HTML
│   ├── package.json          # 项目依赖和脚本
│   ├── vite.config.ts        # Vite配置
│   ├── tsconfig.json         # TypeScript配置
│   ├── tsconfig.node.json    # Node类型配置
│   ├── eslint.config.js      # ESLint配置
│   ├── prettier.config.js    # Prettier配置
│   └── README.md             # 项目说明
├── backend/                   # 后端项目（占位符）
│   ├── src/                  # 后端源代码
│   │   └── main.py           # 主文件（空）
│   └── requirements.txt      # Python依赖（空）
└── README.md                 # 项目总览文档
```

## 设计参考点（基于Otium_wip）

### 1. 登录界面设计
- **布局参考**: 居中卡片式设计，白色背景，黑色主题色
- **元素包含**: Logo图片 + 项目名称"Comes" + 副标题占位符 + 用户名/密码表单
- **交互模式**: 表单实时验证、加载状态显示、错误提示（带图标）
- **样式特点**: 使用CSS变量系统，保持与Otium一致的间距、圆角和字体层次

### 2. 侧边栏设计
- **可折叠设计**: 支持展开/折叠状态，左侧边缘悬停显示切换按钮
- **菜单结构**: 3个模块菜单（"模块一"、"模块二"、"模块三"） + "管理员"菜单（条件显示）
- **用户信息区域**: 显示用户名、剩余次数、过期时间（模拟数据）
- **底部功能区**: API密钥管理按钮、退出登录按钮
- **交互特性**: 支持键盘导航（上下箭头键切换菜单项，Enter键选择）
- **视觉状态**: 活动菜单项黑色背景白色文字，悬停状态灰色背景

### 3. 主题色设计系统
- **颜色基调**: 黑白主题，主色调黑色(`#110D0C`)，背景白色(`#FFFFFF`)
- **CSS变量**: 完整的语义化变量系统（primary, secondary, background, surface等）
- **组件变量**: 侧边栏、按钮、卡片、输入框等专用颜色变量
- **响应式支持**: 使用CSS变量实现潜在的主题切换能力

### 4. 模块页面布局（基本占位符）
- **页面结构**: 使用AppLayout包装，包含侧边栏和主内容区
- **内容区域**: 卡片式布局，参考Otium_wip的双栏设计
- **输入区域**: 大文本区域占位符，带字符计数占位符
- **操作按钮**: 分组排列（左侧主操作按钮，右侧辅助操作按钮如清空、复制）
- **结果展示**: 卡片式结果区域占位符，带复制功能按钮占位符
- **加载状态**: 分步加载提示占位符，进度指示器占位符

### 5. 交互模式参考
- **路由保护**: 私有路由组件（未登录重定向到登录页），管理员路由权限控制
- **状态管理**: Zustand store模式，每个模块独立store，认证状态全局store
- **API集成**: Axios实例配置请求/响应拦截器，统一错误处理
- **表单处理**: 受控组件模式，实时验证反馈
- **本地持久化**: Zustand persist中间件，关键状态保存到localStorage

## 实施步骤

### 阶段1: 项目初始化和基础配置（1小时）
1. 创建`C:\Users\alexa\Documents\GitHub\Comes`目录
2. 将本项目规划文档保存到`C:\Users\alexa\Documents\GitHub\Comes\PROJECT_PLAN.md`作为项目参考文档
3. 在Comes目录下初始化Vite + React + TypeScript项目
4. 安装核心依赖：React Router, Zustand, Axios, Ant Design, Ant Design Icons
5. 配置TypeScript、ESLint、Prettier
6. 创建基础目录结构
7. 配置`.gitignore`文件，确保忽略环境变量文件（`.env*`）、构建输出、依赖目录等

### 阶段2: 设计系统和样式架构（2小时）
1. 参考Otium_wip设计重新实现CSS变量系统（colors.css, typography.css等）
2. 创建全局样式文件（reset.css, base.css）
3. 配置CSS Modules支持
4. 创建工具类CSS（mixins.css）
5. 创建样式文件导入索引

### 阶段3: 核心架构和工具层（2小时）
1. 实现API客户端（axios实例、拦截器、错误处理）
2. 创建TypeScript类型定义（auth.types.ts, module.types.ts等）
3. 实现工具函数（验证、格式化、存储）
4. 配置路由系统（routes.tsx, PrivateRoute.tsx, AdminRoute.tsx）
5. 设置Vite环境配置和别名

### 阶段4: 组件库开发（3小时）
1. 实现基础UI组件（Button, Card, Input, Textarea, Icon）参考Ant Design但自定义
2. 实现布局组件（AppLayout, Sidebar, SidebarItem）
3. 创建组件统一导出文件
4. 为每个组件编写CSS Modules样式
5. 添加组件交互测试

### 阶段5: 状态管理和Hooks（2小时）
1. 实现认证store（auth.store.ts）支持登录、登出、token管理
2. 创建3个模块的占位符store（module1.store.ts等）
3. 实现自定义Hooks（useAuth, useApiKeys）
4. 配置Zustand持久化中间件
5. 创建store统一导出

### 阶段6: 页面组件开发（3小时）
1. 实现登录页面（Login.tsx）参考Otium_wip设计
2. 创建3个模块页面（Module1.tsx, Module2.tsx, Module3.tsx）基本布局占位符
3. 实现管理员页面（Admin.tsx）占位符
4. 创建404页面（NotFound.tsx）
5. 为每个页面编写CSS Modules样式

### 阶段7: 应用集成和测试（1小时）
1. 在App.tsx中集成所有路由和组件
2. 测试登录/登出完整流程
3. 验证侧边栏折叠和菜单切换
4. 测试3个模块页面导航
5. 验证响应式布局
6. 运行构建命令确保无错误

### 阶段8: 部署配置准备（1小时）
1. 配置Vite环境变量文件（.env.development, .env.production）
2. 设置API客户端动态基址，支持环境变量注入
3. 配置开发服务器代理，解决本地开发CORS问题
4. 创建Netlify部署配置文件（netlify.toml或_redirects）
5. 创建Render后端部署配置文件（render.yaml或Dockerfile）
6. 更新README.md包含部署说明
7. 验证热重载功能正常工作，代码更改后自动刷新

## 关键文件路径

1. `C:\Users\alexa\Documents\GitHub\Comes\PROJECT_PLAN.md` - 本项目规划文档（当前文件副本）
2. `C:\Users\alexa\Documents\GitHub\Comes\frontend\package.json` - 项目依赖和脚本配置
3. `C:\Users\alexa\Documents\GitHub\Comes\frontend\vite.config.ts` - 构建工具配置（含代理设置）
4. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\styles\design-system\colors.css` - 主题色CSS变量
5. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\router\routes.tsx` - 路由配置定义
6. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\components\layout\Sidebar\Sidebar.tsx` - 侧边栏组件
7. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\pages\Login\Login.tsx` - 登录页面
8. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\pages\Module1\Module1.tsx` - 模块1占位符页面
9. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\store\auth.store.ts` - 认证状态管理
10. `C:\Users\alexa\Documents\GitHub\Comes\frontend\src\App.tsx` - 应用根组件
11. `C:\Users\alexa\Documents\GitHub\Comes\frontend\.env.development` - 开发环境变量
12. `C:\Users\alexa\Documents\GitHub\Comes\frontend\.env.production` - 生产环境变量
13. `C:\Users\alexa\Documents\GitHub\Comes\frontend\netlify.toml` - Netlify部署配置
14. `C:\Users\alexa\Documents\GitHub\Comes\backend\render.yaml` - Render后端部署配置

## 占位符命名策略

### 功能命名占位符
- 模块功能: 使用`// TODO:`注释标明待实现功能
- 按钮文本: 使用`[功能描述]`格式，如`[模块一主要操作]`
- API端点: 使用`/api/todo/`路径前缀，返回模拟数据
- 状态属性: 使用通用名称，如`module1Data`, `module2Result`

### 模块命名占位符
- 侧边栏菜单: `模块一`, `模块二`, `模块三`, `管理员`
- 页面组件: `Module1`, `Module2`, `Module3`, `Admin`
- 路由路径: `/module1`, `/module2`, `/module3`, `/admin`
- 状态存储: `module1Store`, `module2Store`, `module3Store`
- 页面标题: `模块一功能`, `模块二功能`, `模块三功能`

### 后端占位符
- API路由: 返回`{ success: true, message: "功能待实现" }`格式的模拟响应
- 数据库: 使用内存对象模拟数据存储
- 业务逻辑: 简单延时模拟，返回固定数据
- 认证系统: 模拟用户名密码验证（固定凭据）

## 测试验证方案

### 开发环境验证
1. **项目启动**: `npm run dev` 成功启动开发服务器，无编译错误
2. **登录流程**: 访问首页重定向到登录页，输入凭据后跳转到主页面
3. **侧边栏功能**: 测试展开/折叠，菜单项点击导航，键盘导航支持
4. **模块切换**: 点击3个模块菜单，正确切换到对应页面
5. **响应式测试**: 调整浏览器窗口大小，验证布局适应性
6. **控制台检查**: 浏览器开发者工具无JavaScript错误或警告

### 构建验证
1. **生产构建**: `npm run build` 成功生成dist目录
2. **预览测试**: `npm run preview` 可正常访问构建后的应用
3. **类型检查**: `npm run type-check` 无TypeScript错误
4. **代码检查**: `npm run lint` 通过ESLint检查

### 设计一致性验证
1. **主题色**: 检查所有组件正确应用CSS变量颜色
2. **间距系统**: 验证各元素间距符合设计系统规范
3. **字体层次**: 检查标题、正文、辅助文本字体大小和粗细
4. **交互状态**: 测试按钮hover、active、disabled状态视觉效果
5. **加载状态**: 验证加载指示器样式和位置

### 代码质量验证
1. **TypeScript类型**: 确保无`any`类型滥用，类型定义完整
2. **组件结构**: 遵循单一职责原则，组件接口清晰
3. **状态管理**: 状态划分合理，避免不必要的全局状态
4. **错误处理**: API调用和用户操作有适当的错误反馈
5. **性能考虑**: 组件适当使用React.memo，避免不必要的重渲染

## 成功标准

1. ✅ 项目在`C:\Users\alexa\Documents\GitHub\Comes`目录下创建完成
2. ✅ 前端项目使用Vite + React + TypeScript技术栈
3. ✅ 开发服务器可启动（`npm run dev`），无编译错误
4. ✅ 登录界面设计与Otium_wip保持一致（布局、样式、交互）
5. ✅ 侧边栏可折叠，显示3个模块菜单和用户信息区域
6. ✅ 3个模块页面可访问，包含基本卡片布局占位符
7. ✅ 主题色CSS变量系统正常工作，所有组件使用变量
8. ✅ 路由保护生效：未登录用户无法访问主页面
9. ✅ 状态管理正常工作：登录状态持久化，模块状态独立
10. ✅ 项目可构建部署（`npm run build`成功）
11. ✅ 本地热重载调试正常工作，代码更改后自动刷新
12. ✅ 预留Netlify和Render部署配置，支持前后端分离部署

## 部署准备

### Netlify前端部署配置
1. **构建配置**: 在`vite.config.ts`中配置正确的构建输出路径和基础URL
2. **环境变量**: 使用`.env`文件管理环境变量，支持`VITE_`前缀变量
3. **重定向规则**: 创建`_redirects`文件或`netlify.toml`配置SPA路由重写
4. **构建命令**: 在`package.json`中设置`"build": "vite build"`
5. **部署分支**: 配置主分支自动部署，预览分支部署

### Render后端部署准备
1. **后端结构**: 在`backend/`目录下预留Python（Flask/FastAPI）或Node.js后端结构
2. **启动脚本**: 创建`render.yaml`或Dockerfile配置Render部署
3. **环境变量**: 设计可配置的数据库连接、API密钥等环境变量
4. **CORS配置**: 后端API配置允许前端域名跨域访问
5. **健康检查**: 实现`/health`端点用于Render健康检查

### 本地开发与部署环境分离
1. **环境配置**:
   - `.env.development`: 本地开发环境变量（本地API地址）
   - `.env.production`: 生产环境变量（部署后的API地址）
2. **API基址动态配置**:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
   ```
3. **代理设置**: 在`vite.config.ts`中配置开发服务器代理，避免CORS问题
4. **构建优化**: 配置代码分割、资源哈希、预加载等生产优化

### 热重载调试支持
1. **Vite开发服务器**: 默认支持热模块替换（HMR），快速反馈代码更改
2. **状态保持**: 配置Zustand状态在热重载时保持，避免状态丢失
3. **错误覆盖**: 配置错误覆盖层，实时显示编译错误和运行时错误
4. **开发工具集成**: React DevTools和Zustand DevTools在开发环境自动启用

### 部署流程预留
1. **前端部署到Netlify**:
   - 连接GitHub仓库，自动部署主分支
   - 配置环境变量：`VITE_API_BASE_URL`指向Render后端
   - 设置自定义域名（可选）
2. **后端部署到Render**:
   - 创建Web Service，连接GitHub后端目录
   - 配置环境变量：数据库连接、密钥等
   - 设置自动部署和健康检查
3. **前后端连接**:
   - 前端构建时注入后端API地址
   - 配置CORS允许Netlify域名访问
   - 实现API版本管理和兼容性

### 灵活性设计
1. **配置可替换**: 所有部署相关配置集中在配置文件，易于修改
2. **环境自适应**: 应用根据环境自动调整API端点、功能开关等
3. **本地优先**: 开发环境默认使用本地资源，无需外部依赖
4. **部署就绪**: 项目结构已包含部署所需文件模板，只需填充具体值

### 环境变量与Git忽略机制
1. **Git忽略配置**: 在`.gitignore`文件中包含`.env*`模式，确保环境变量文件不提交到GitHub
2. **环境变量模板**: 创建`.env.example`文件，列出所有需要的环境变量及其说明
3. **安全变量**: 敏感数据（API密钥、数据库密码）必须使用环境变量，绝不硬编码
4. **多环境支持**:
   - `.env.development`: 本地开发环境（可提交示例）
   - `.env.production`: 生产环境（不提交，由部署平台配置）
   - `.env.local`: 本地覆盖文件（`.gitignore`忽略）
5. **文档说明**: 在README.md中说明如何复制`.env.example`为`.env.local`并填写实际值
6. **部署平台集成**: Netlify和Render支持环境变量配置界面，与本地开发保持一致

## 可维护性和扩展性设计

### 代码组织与架构
1. **分层架构**: 清晰的分层（UI组件层、业务逻辑层、状态管理层、API层）
2. **模块化设计**: 功能模块独立，低耦合高内聚，便于单独开发测试
3. **组件复用**: 建立可复用UI组件库，减少重复代码
4. **目录结构**: 按功能而非类型组织文件，便于功能模块的查找和维护

### 开发规范与质量
1. **代码规范**: 统一ESLint和Prettier配置，强制执行代码风格
2. **TypeScript策略**: 严格类型检查，避免any类型，定义完整接口
3. **命名约定**: 统一命名规范（组件PascalCase，变量camelCase，常量UPPER_CASE）
4. **注释规范**: 公共API和复杂逻辑添加JSDoc注释，业务逻辑添加必要说明

### 测试策略
1. **测试层级**: 单元测试（组件、工具函数）、集成测试（模块交互）、E2E测试（关键流程）
2. **测试工具**: Vitest + React Testing Library + MSW（模拟API）
3. **测试覆盖**: 核心业务逻辑和组件要求测试覆盖，非关键UI可适当降低
4. **测试数据**: 使用工厂函数生成测试数据，保持测试独立性

### 状态管理设计
1. **状态划分**: 全局状态（用户认证） vs 模块状态（功能数据）
2. **状态更新**: 使用不可变更新模式，避免直接状态修改
3. **状态派生**: 使用Zustand选择器派生计算状态，避免冗余存储
4. **状态持久化**: 重要状态配置持久化，但注意敏感数据安全

### API设计
1. **API客户端**: 统一axios实例，集中错误处理和拦截逻辑
2. **类型安全**: API响应和请求体完整TypeScript类型定义
3. **版本管理**: API路径包含版本号，支持向后兼容
4. **错误处理**: 统一错误格式，前端友好错误提示

### 组件设计原则
1. **单一职责**: 每个组件只做一件事，保持小巧专注
2. **受控与非受控**: 明确组件控制模式，提供灵活API
3. **组合优于继承**: 使用组件组合而非继承实现复杂UI
4. **性能优化**: 合理使用React.memo、useMemo、useCallback避免不必要的重渲染

### 扩展性考虑
1. **插件化架构**: 支持通过配置添加新功能模块
2. **主题系统**: CSS变量支持轻松切换主题色和样式
3. **国际化预留**: 代码结构支持i18n，文本内容抽离
4. **功能开关**: 支持功能标记，便于A/B测试和渐进式发布
5. **新模块添加**: 标准化模块添加流程（路由+页面+状态+API）

### 重构与演进
1. **代码债务管理**: 定期重构，消除技术债务
2. **依赖更新**: 定期更新依赖，保持技术栈现代化
3. **性能监控**: 集成性能监测，识别优化点
4. **代码分割**: 路由级代码分割，优化首屏加载

### 文档与知识共享
1. **项目文档**: README包含项目概述、开发指南、部署说明
2. **组件文档**: 使用Storybook或类似工具记录组件用法
3. **API文档**: 使用Swagger或类似工具生成API文档
4. **决策记录**: 重要技术决策记录在ARCHITECTURE.md
5. **开发指南**: CONTRIBUTING.md包含代码提交、测试、发布流程

### 工具与自动化
1. **Git工作流**: 标准化分支策略（Git Flow或Trunk Based Development）
2. **CI/CD管道**: 自动化测试、构建、部署流程
3. **代码质量门禁**: PR检查包括测试通过、代码覆盖、类型检查
4. **依赖安全**: 集成依赖漏洞扫描

## 注意事项

1. **设计参考非复制**: 所有代码重新实现，仅参考Otium_wip的UI设计和交互模式
2. **占位符清晰**: 所有待实现功能使用一致的占位符标记，便于后续开发
3. **类型安全**: 全面使用TypeScript，避免`any`类型，提供完整类型定义
4. **可维护性**: 代码结构清晰，组件职责单一，便于后续功能添加
5. **扩展性**: 架构支持轻松添加新模块和功能
6. **文档完整**: 关键代码添加注释说明，README提供项目概述