# 自动生成运营后台

## 本地调试
修改 public/index.html:

1. 修改 TOCLFMHonESsHTsc 为你的 client id
2. 替换原有的表数据
```javascript
  window._USER_CONFIG = {
      TABLE_LIST: [{name: 'dev_team_test', id: 43488}, {name: 'test_user_dash', id: 52124}]
    }
    window.ACTIVE_TABLE_ID = window._USER_CONFIG.TABLE_LIST[0].id
```

## 二次开发

本项目是在 AntDesign 的[create-react-app-antd](https://github.com/ant-design/create-react-app-antd) 项目的基础上改进，并结合了知晓云的 [OPEN API](https://doc.minapp.com/open-api/) 进行开发的

src 目录结构如下
```text
├── App.css 
├── App.js
├── components
│   ├── AddRowModalView  // 添加/编辑行模态框
│   ├── CommonContainer  // 样式组件
│   ├── CreateFormItem   // 表单控件渲染组件
│   ├── SchemaDataFilterFormModal // 查询模态框
│   ├── SchemaFileUpload // 文件上传组件
│   ├── SchemaList       // 左侧栏列表
│   └── SchemaTable      // 表格组件
├── constants.js          // 常量配置
├── index.css
├── index.js
├── io                  // 接口 API
│   └── index.js
├── registerServiceWorker.js
└── utils.js            // 工具函数

```

目前数据表的展示和编辑仅支持以下数据格式
- id
- string
- number
- integer
- file
- data

暂不支持以下数据格式
- array
- object
- geojson