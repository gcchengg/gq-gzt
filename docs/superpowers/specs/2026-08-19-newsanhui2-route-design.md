# newSanhui2 独立路由设计

## 目标

为已复制的 `src/pages/newSanhui2` 页面注册独立访问路径 `/newSanhui2`，使下列地址能够加载 V2 页面并保留查询参数行为：

`/newSanhui2?task=decisionExecution&autoOpen=1`

## 范围

- 在 `src/routes.jsx` 中懒加载 `@/pages/newSanhui2`。
- 新增 `path: "newSanhui2"` 路由，并渲染 V2 页面组件。
- 保持现有 `/newSanhui` 路由及 `src/pages/newSanhui` 内容不变。
- 不修改首页或其他页面中现有的 `/newSanhui` 链接。

## 结构与数据流

浏览器访问 `/newSanhui2` 后，React Router 匹配新增路由，通过 `Suspense` 懒加载 `src/pages/newSanhui2/index.jsx`。查询参数继续由该页面现有的 `useSearchParams` 逻辑读取，无需增加参数转换层。

## 错误处理

沿用项目现有路由的错误边界和懒加载行为，不新增特殊错误处理。

## 验证

- 路由配置检查确认 `/newSanhui2` 指向 `@/pages/newSanhui2`。
- 运行项目构建，确认模块解析和打包成功。
- 启动开发服务后访问目标 URL，确认页面正常加载并响应 `task=decisionExecution&autoOpen=1`。

