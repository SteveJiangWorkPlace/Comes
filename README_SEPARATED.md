# 前后端分离版本

## 目录
- `backend/app.py`: FastAPI 后端入口
- `backend/routers/common.py`: 健康检查、密钥状态、网络诊断
- `backend/routers/ps_edit.py`: PS 修改
- `backend/routers/writing.py`: CV 写作、RL 写作
- `frontend/index.html`: 静态前端页面
- `frontend/modules/psEdit.js`: PS 修改交互
- `frontend/modules/cv.js`: CV 写作交互
- `frontend/modules/rl.js`: RL 写作交互

## 启动
1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 配置环境变量：
```bash
GOOGLE_API_KEY
```

3. 启动后端：
```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

4. 启动前端静态服务：
```bash
python -m http.server 5500 --directory frontend
```

5. 打开：
```text
http://127.0.0.1:5500
```

## 功能
- `PS修改`：流式生成、按段修改、翻译、去 AI 化
- `CV写作`：多模态融合生成 JSON、缺失项分析、补充更新、导出 Word
- `RL写作`：提取推荐人信息、生成中文草稿、生成英文成稿、复制全文
