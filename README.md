# 大学成绩 / GPA 模拟器 v1.1

纯前端的大学成绩和 GPA 模拟器。v1.1 使用现代仪表盘 UI，不使用数据库、不接后端、不登录、不接外部 API，数据保存在当前浏览器的 localStorage 中。

## 功能

- 添加、编辑、删除多门课程
- 课程类型标签：必修课、专业课、选修课
- 计算当前已知贡献分、预计总评、课程绩点
- 根据目标总评反推一个成绩项需要多少分
- 默认 4.33 制 GPA 规则，绩点统一保留两位小数
- 自定义 GPA 规则表，不使用 JS 公式或 eval
- GPA 换算前先将最终成绩四舍五入为整数
- 只把完整课程计入总 GPA 和加权平均分
- 导入 / 导出 JSON 备份
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
