# 自动生成运营后台

知晓云支持开发者结合 User Dash API 按需编写一套独立的运营后台，并支持一键部署至知晓云服务器，用户可以通过生成的链接直接访问使用。

- 该服务适用于需要独立管理后台的用户，比如你的运营同事，并非开发者，你也不会希望他直接操作数据表，此时你可以写一套简单的运营后台供运营同事使用。

如果你的电脑没有 nodejs，请先[下载 nodejs](https://nodejs.org/en/download/) 并安装

## 本地调试
修改 public/index.html:

1. 修改 TOCLFMHonESsHTsc 为你的 client id
2. 替换原有的表数据
```javascript
  window._USER_CONFIG = {
      TABLE_LIST: [
        {name: 'dev_team_test' /* 数据表名称 */, id: 43488 /* 数据表 id */}, 
        {name: 'test_user_dash', id: 52124}]
    }
```

## 部署到运营后台
第一步：首先在此项目跟目录下执行 `npm run build`

成功时如下图所示：

![](res/build-success.png)

第二步：将 dist 目录中的文件压缩为 zip 包：

![](res/zip.png)

第三步：在[知晓云运营后台](https://cloud.minapp.com/dashboard/#/app/user-dashboard/)部署代码

![](res/step-1.png)
![](res/step-2.png)

稍等一会，进入控制台，即可看到部署成功的运营后台
![](res/success.png)


## 二次开发

本项目是在 AntDesign 的 [create-react-app-antd](https://github.com/ant-design/create-react-app-antd) 项目基础上改进，并结合了知晓云的 [OPEN API](https://doc.minapp.com/open-api/) 进行开发

### 预备知识
在开发之前，建议你对以下罗列的几个知识点有所了解：

- 基础的 HTML/CSS/JS 知识
- React 前端框架
- webpack 构建工具
- antDesign UI

### 项目目录结构
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
├── index.js            // 入口
├── io                  // 接口 API
│   └── index.js
├── registerServiceWorker.js
└── utils.js            // 工具函数

```
## 待完善的功能
### 数据格式
目前数据表的展示和编辑支持以下数据格式
- id
- string
- number
- integer
- file
- data
- array
- object
- geojson


### 批量删除
目前 OPEN API 暂不支持批量删除功能


## 其他

[一键部署运营后台示例（旧）](https://github.com/ifanrx/hydrogen-demo/blob/master/user-dash-demo/)
