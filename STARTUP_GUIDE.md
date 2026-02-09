# Comes 项目启动指南

## 项目概述

Comes是一个全栈学生申请信息处理系统，前端基于React + TypeScript，后端基于Flask + Google GenAI。

## 快速启动

### 1. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

### 2. 后端启动

```bash
cd backend

# 安装Python依赖（推荐使用虚拟环境）
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置GOOGLE_GENAI_API_KEY

# 启动开发服务器
python app.py
# 或使用开发脚本
python run_dev.py
```

后端将在 http://localhost:5000 启动

### 3. 验证系统运行

1. 访问前端: http://localhost:3000
2. 登录（使用测试账户）
3. 访问后端健康检查: http://localhost:5000/api/health

## 环境配置

### 必需的环境变量

**后端 (.env文件):**
- `GOOGLE_GENAI_API_KEY`: Google GenAI API密钥（必需，用于文档分析）
- `SECRET_KEY`: Flask应用密钥（用于会话安全）
- `FLASK_ENV`: 环境（development/production）

**前端 (.env.local文件):**
- `VITE_API_BASE_URL`: 后端API地址（默认: http://localhost:5000）

### 获取Google GenAI API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建API密钥
3. 复制密钥到`.env`文件

## 测试学生申请信息功能

### 使用curl测试API

1. **上传文件:**
```bash
curl -X POST \
  -F "transcript=@/path/to/transcript.pdf" \
  -F "degree_certificate=@/path/to/degree.pdf" \
  -F "resume=@/path/to/resume.docx" \
  -F "ielts_score=@/path/to/ielts.pdf" \
  http://localhost:5000/api/student-applications/upload
```

2. **分析文档:**
```bash
curl -X POST http://localhost:5000/api/student-applications/analyze/{application_id}
```

3. **获取结果:**
```bash
curl http://localhost:5000/api/student-applications/{application_id}
```

### 支持的文件格式

- **PDF** (.pdf): 成绩单、学位证书、雅思成绩单
- **Word文档** (.docx, .doc): 简历、个人陈述
- **图像** (.png, .jpg, .jpeg): 扫描文档
- **文本** (.txt): 纯文本信息

最大文件大小: 16MB

## 开发工作流

### 前端开发
```bash
cd frontend
npm run dev        # 启动开发服务器（热重载）
npm run build      # 生产构建
npm run lint       # 代码检查
npm run type-check # TypeScript类型检查
```

### 后端开发
```bash
cd backend
python app.py                    # 标准启动
python run_dev.py               # 开发启动（带提示）
# 启用调试模式
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## 故障排除

### 常见问题

1. **前端无法连接后端**
   - 检查`VITE_API_BASE_URL`是否正确
   - 确认后端正在运行（`http://localhost:5000/api/health`）
   - 检查CORS配置

2. **文件上传失败**
   - 检查文件大小（≤16MB）
   - 确认文件格式受支持
   - 检查uploads目录权限

3. **Google GenAI分析失败**
   - 确认`GOOGLE_GENAI_API_KEY`已设置
   - 验证API密钥有效
   - 检查网络连接

4. **文本提取失败**
   - 安装缺失的依赖：`pip install pdfplumber python-docx Pillow pytesseract`
   - 对于OCR，安装Tesseract：`brew install tesseract` (macOS) 或 `sudo apt-get install tesseract-ocr` (Linux)

### 依赖安装问题

如果安装Python依赖失败：
```bash
# 升级pip
python -m pip install --upgrade pip

# 使用国内镜像（中国大陆）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或逐包安装
pip install flask flask-cors python-dotenv werkzeug
pip install google-genai PyPDF2 pdfplumber Pillow python-docx
```

## 部署

### 前端部署 (Netlify)
- 配置在`frontend/netlify.toml`
- 设置环境变量`VITE_API_BASE_URL`为后端生产地址

### 后端部署 (Render)
- 配置在`backend/render.yaml`
- 在Render控制台设置环境变量
- 上传目录需要持久化存储

## 项目结构

```
Comes/
├── frontend/                 # 前端React应用
│   ├── src/
│   │   ├── api/            # API客户端和类型
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── store/          # Zustand状态管理
│   │   └── styles/         # 样式系统
│   └── package.json        # 依赖和脚本
├── backend/                 # 后端Flask应用
│   ├── student_applications/ # 学生申请信息模块
│   │   ├── routes.py       # API路由
│   │   ├── services.py     # GenAI服务
│   │   ├── models.py       # 数据模型
│   │   └── utils.py        # 文档处理工具
│   ├── app.py              # 主Flask应用
│   ├── requirements.txt    # Python依赖
│   └── run_dev.py          # 开发启动脚本
└── README.md               # 项目总览
```

## 下一步开发

1. **前端集成**: 实现学生申请信息上传界面
2. **数据库集成**: 将内存存储替换为SQL数据库
3. **用户认证**: 完善用户权限系统
4. **更多AI模块**: 添加其他文档分析功能
5. **文件管理**: 集成云存储服务

## 获取帮助

- 查看详细文档: `frontend/README.md` 和 `backend/README.md`
- 检查项目规划: `PROJECT_PLAN.md`
- 验证环境配置: 确保所有环境变量正确设置