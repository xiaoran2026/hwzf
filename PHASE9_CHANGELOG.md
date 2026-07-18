# Phase 9: StoreAI Doctor 真实业务闭环修复

## 目标
修复上传CSV后无法生成AI分析报告的问题，打通完整SaaS业务流程。

---

## 一、问题诊断

### 核心问题
1. **FileUploadController.uploadCsv() 同步阻塞**：在一个HTTP请求中同步执行CSV解析→数据分析→DeepSeek AI报告生成，DeepSeek API调用可能耗时30秒以上，导致HTTP请求超时，前端收不到响应。
2. **前端上传页面未实现真实上传逻辑**：`handleUpload` 只有 `console.log`，没有调用后端API。
3. **前端多页面使用Mock数据**：Dashboard、Reports、Store Detail在API返回空数据时显示Demo数据，掩盖了真实问题。
4. **缺少任务状态查询机制**：前端无法知道分析进度，用户上传后无反馈。
5. **缺少文件大小/空文件/超大文件校验**：可能导致OOM或空分析。

---

## 二、修改文件列表

### 后端（Java）

| 文件 | 操作 | 说明 |
|------|------|------|
| `StoreAiDoctorApplication.java` | 修改 | 添加 `@EnableAsync` 注解 |
| `config/AsyncConfig.java` | 新增 | 配置 `@Async` 线程池（core=2, max=5, queue=50） |
| `config/SecurityConfig.java` | 已有 | `/error` permitAll（上一阶段修复） |
| `controller/FileUploadController.java` | 修改 | 上传后异步执行分析，返回taskId；增加文件大小限制(10MB)、空文件检查、行数限制(50000) |
| `controller/TaskController.java` | 新增 | `GET /api/tasks/{taskId}` 查询任务状态及reportId |
| `controller/StoreController.java` | 修改 | 新增 `GET /api/stores/{storeId}` 接口 |
| `service/AsyncAnalysisService.java` | 新增 | `@Async` 异步执行数据分析和AI报告生成，分步更新任务状态 |
| `service/CsvParseService.java` | 修改 | 增加行数超限检查(>50000行抛异常) |
| `entity/Store.java` | 修改 | `createdTime` 添加 `@JsonProperty("createdAt")` 以匹配前端字段 |
| `dto/UploadResponse.java` | 修改 | 新增 `taskId` 字段 |
| `dto/TaskStatusDTO.java` | 新增 | 任务状态响应DTO |

### 前端（TypeScript / Next.js）

| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/types.ts` | 修改 | 新增 `TaskStatus`、`UploadResponse` 类型 |
| `lib/api.ts` | 修改 | 新增 `tasksApi.getTaskStatus`、`uploadApi.uploadCsv`、`storesApi.getStore` |
| `app/stores/[storeId]/upload/page.tsx` | 修改 | 实现真实文件上传，调用 `/api/files/upload`，成功后跳转 `/analysis/task/{taskId}` |
| `app/analysis/task/layout.tsx` | 新增 | 复用 DashboardLayout |
| `app/analysis/task/[taskId]/page.tsx` | 新增 | 分析状态页面：轮询任务状态、显示进度条、步骤列表、完成后自动跳转报告页 |
| `app/dashboard/page.tsx` | 修改 | 移除 `demoData` fallback，空状态显示真实提示，调用真实API |
| `app/reports/page.tsx` | 修改 | 移除 `demoReports` fallback，空状态显示真实提示 |
| `app/stores/[storeId]/page.tsx` | 修改 | 改为调用 `GET /api/stores/{storeId}` 真实API |

---

## 三、业务流程

```
用户上传CSV
    |
    v
POST /api/files/upload
    - 校验文件（大小/格式/空文件/行数）
    - 保存文件到磁盘
    - 创建 uploaded_files (status=UPLOADED)
    - 创建 analysis_tasks (status=PENDING, progress=0)
    - 解析CSV，保存 order_records
    - 更新 analysis_tasks (status=PARSING, progress=10)
    - 启动 @Async 异步任务
    - 返回 {fileId, fileName, status, storeId, taskId}
    |
    v
前端跳转 /analysis/task/{taskId}
    - 每3秒轮询 GET /api/tasks/{taskId}
    - 显示进度条和各阶段状态
    |
    v
@Async 后台执行
    - ANALYZING (25%)  -> AnalysisEngineService.analyzeAndSave()
    - GENERATING_REPORT (50%) -> AiReportService.generateReport()
    - COMPLETED (100%) -> 更新 analysis_tasks
    |
    v
前端检测到 status=COMPLETED
    - 自动跳转到 /reports/{reportId}
```

---

## 四、任务状态流转

| 状态 | 进度 | 说明 |
|------|------|------|
| PENDING | 0 | 任务已创建，等待开始 |
| PARSING | 10 | CSV解析完成，订单已保存 |
| ANALYZING | 25 | 数据分析引擎执行中 |
| GENERATING_REPORT | 50 | DeepSeek AI生成报告中 |
| COMPLETED | 100 | 全部完成，reportId已生成 |
| FAILED | 0 | 处理失败（CSV错误/AI失败/超时等） |

---

## 五、接口文档

### 5.1 上传CSV
```
POST /api/files/upload
Content-Type: multipart/form-data

请求参数:
  file     File   必填, CSV文件, 最大10MB, 最大50000行
  storeId  Long   必填

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "fileId": 1,
    "fileName": "orders.csv",
    "status": "UPLOADED",
    "storeId": 1,
    "taskId": 1
  }
}

错误响应:
  401 - Unauthorized
  400 - File is empty / Only CSV files are allowed / File size exceeds 10MB / Row count exceeds 50000
```

### 5.2 查询任务状态
```
GET /api/tasks/{taskId}
Authorization: Bearer {token}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": 1,
    "fileId": 1,
    "fileName": "orders.csv",
    "status": "COMPLETED",
    "progress": 100,
    "reportId": 3,
    "createdTime": "2024-01-15T10:30:00"
  }
}
```

### 5.3 获取店铺详情
```
GET /api/stores/{storeId}
Authorization: Bearer {token}

响应:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "storeName": "My Store",
    "platform": "Shopify",
    "createdAt": "2024-01-10T08:00:00"
  }
}
```

---

## 六、测试步骤

### 6.1 环境准备
1. 确保 MySQL 服务运行（端口 3307，密码 123456）
2. 确保 DeepSeek API Key 在 `application.yml` 中配置正确
3. 启动后端：`mvn spring-boot:run`
4. 启动前端：`npm run dev`

### 6.2 基础流程测试

**步骤1：登录并创建店铺**
1. 访问 http://localhost:3000/login
2. 登录已有账户或注册新账户
3. 进入 /stores，点击 "Create Store"
4. 填写店铺名称和平台，创建成功

**步骤2：上传CSV**
1. 进入店铺详情页，点击 "Upload Data"
2. 拖拽或选择一个有效的CSV文件（格式：order_id, date, customer_id, product_name, quantity, price, country）
3. 点击 "Upload & Analyze"
4. 预期：页面跳转到 `/analysis/task/{taskId}`，显示进度

**步骤3：观察分析进度**
1. 在 `/analysis/task/{taskId}` 页面等待
2. 预期看到状态流转：Parsing -> Analyzing -> AI Generating -> Completed
3. 进度条从 10% -> 25% -> 50% -> 100%
4. 完成后自动跳转到 `/reports/{reportId}`

**步骤4：查看报告**
1. 报告详情页显示 Health Score、Summary、各维度 Insights
2. 返回 /reports 列表，新报告应出现在列表顶部

### 6.3 错误场景测试

**测试：空文件**
1. 上传一个只有表头、没有数据行的CSV
2. 预期：返回错误 "CSV file contains no valid order records"

**测试：超大文件**
1. 上传一个超过10MB的CSV
2. 预期：返回错误 "File size exceeds 10MB limit"

**测试：非CSV文件**
1. 上传一个 .txt 或 .xlsx 文件
2. 预期：返回错误 "Only CSV files are allowed"

**测试：错误CSV格式**
1. 上传一个缺少必要列的CSV
2. 预期：解析失败，任务状态变为 FAILED

### 6.4 Mock数据清理验证

**测试：Dashboard 空状态**
1. 清空数据库中的订单和报告数据
2. 访问 /dashboard
3. 预期：显示 "No data yet" 空状态，有 "Upload Data" 按钮

**测试：Reports 空状态**
1. 清空报告数据
2. 访问 /reports
3. 预期：显示 "No reports yet" 空状态

**测试：Store Detail 真实数据**
1. 访问 /stores/{storeId}
2. 预期：显示真实的店铺名称、平台、创建时间

---

## 七、关键设计决策

1. **异步分析**：使用 Spring `@Async` + 线程池，将耗时操作（DeepSeek API调用）从HTTP请求中剥离，避免超时。
2. **任务轮询**：前端每3秒轮询任务状态，用户体验良好，实现简单。
3. **逐步状态更新**：任务状态分5步流转，用户可清楚看到当前阶段。
4. **空状态优先**：所有页面移除Mock数据fallback，真实反映后端状态，便于发现问题。
5. **事务边界**：CSV解析和订单保存仍在上传接口的事务中（保证一致性），分析和AI报告生成在异步任务中各自管理事务（失败不影响已保存的订单数据）。

---

## 八、重启说明

修改完成后，需要重启后端服务以加载：
- 新增的 `@EnableAsync` 配置
- 新增的 AsyncConfig 线程池
- 修改后的 SecurityFilterChain（`/error` permitAll）

前端 Next.js 开发服务器会自动热重载，无需重启。
