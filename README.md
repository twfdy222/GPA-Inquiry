# 大学成绩 / GPA 模拟器 v2.0

纯前端、本地优先的大学成绩和 GPA 工作台。v2.0 引入多学期管理、IndexedDB 本地存储、基础分析图表和 CSV/XLSX 导入导出；不接后端、不登录、不接外部 API。

## 功能

- 添加、编辑、删除多门课程
- 多学期管理，支持当前学期 / 全部课程视图
- 课程类型标签：必修课、专业课、选修课
- 计算当前已知贡献分、预计总评、课程绩点
- 根据目标总评反推一个成绩项需要多少分
- 默认 4.33 制 GPA 规则，绩点统一保留两位小数
- 自定义 GPA 规则表，不使用 JS 公式或 eval
- GPA 换算前先将最终成绩四舍五入为整数
- 只把完整课程计入总 GPA 和加权平均分
- 导入 / 导出 JSON 备份、CSV 和 XLSX 标准表格
- 基础分析图表：学期趋势、学分构成、风险课程
- IndexedDB 本地保存，并兼容迁移 v1.0 / v1.1 localStorage 数据
- 复制课程、折叠 GPA 规则、数字步进输入
- localStorage 数据容错，损坏数据不会导致页面白屏

## 本地运行

```powershell
cd "C:\Users\twfd\Desktop\GPA Inquiry"
npm.cmd install
npm.cmd run dev
```

浏览器打开终端显示的本地地址，默认是：

```txt
http://127.0.0.1:5173/
```

也可以直接双击：

```txt
start-gpa-inquiry.bat
```

## 验证

```powershell
npm.cmd run lint
npm.cmd run build
```
