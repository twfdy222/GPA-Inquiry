# GPA Inquiry v2.1

本地优先的大学成绩与 GPA 工作台，支持按学期整理课程、即时测算绩点，并提供目标分数反推、表格导入导出和基础分析能力。

## 功能

- 按学期管理课程，支持当前学期和全部课程视图
- 课程支持必修、专业、选修分类
- 即时计算已知贡献分、预估总评和课程绩点
- 根据目标总评反推待完成成绩项所需分数
- 自定义 GPA 规则，按最终成绩四舍五入后再换算绩点
- 仅将完整课程计入总 GPA 和加权平均分
- 支持 JSON 备份，以及 CSV / XLSX 课程表导入导出
- 提供学期趋势、学分构成和风险课程等基础分析
- 本地存储数据，并兼容旧版数据迁移

## 本地运行

```powershell
cd "C:\Users\twfd\Desktop\GPA Inquiry"
npm.cmd install
npm.cmd run dev
```

默认访问地址：

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
