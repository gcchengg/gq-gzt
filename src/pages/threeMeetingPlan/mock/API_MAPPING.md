# 三会计划接口与 Mock 数据映射

当前页面先走 `src/pages/threeMeetingPlan/mockApi.js`，所有接口都返回本地 JSON 或内存数据。

| 函数 | 原接口 | 方法 | Mock 文件 | 用途 |
| --- | --- | --- | --- | --- |
| `getTaskByBizId` | `/uwone-ei/eoSanhuiAnnualPlanTask/getTaskByBizId` | GET | `tasksByBizId.json` | 根据 `bizId` 获取任务年度 |
| `getAllYears` | `/uwone-ei/eoSanhuiAnnualPlanTask/getAllYears` | GET | `years.json` | 获取年度下拉 |
| `getPlanList` | `/uwone-ei/eoSanhuiAnnualPlan/getList` | POST | `planList.json` | 获取三会计划主表 |
| `getPlanItemList` | `/uwone-ei/eoSanhuiAnnualPlanItem/getList` | POST | `planItems.json` | 获取某公司、某月份计划议题明细 |
| `savePlanItem` | `/uwone-ei/eoSanhuiAnnualPlanItem/save` | POST | `planItems.json` | 新增/编辑计划议题 |
| `getInfoById` | `/uwone-ei/eoSanhuiAnnualPlanItem/getInfoById` | GET | `planItems.json` | 编辑抽屉回显单条计划议题 |
| `removeById` | `/uwone-ei/eoSanhuiAnnualPlanItem/removeById` | GET | `planItems.json` | 删除计划议题 |
| `closeTask` | `/uwone-ei/eoSanhuiAnnualPlanTask/closeTask` | GET | `tasksByBizId.json` | 结束任务 |
| `topicSanAdd` | 原项目 `topicSanAdd({ level, parentId })` | GET/POST | `categoryTree.json` | 获取议题分类大/中/小 |
| `getByCategoryLv3Id` | `/uwone-ei/sanhuiTopicModel/getByCategoryLv3Id` | GET | `categoryTree.json` | 根据小类带出决策层级 |
| `getUserOrgInfo` | `api.orgManage.getUserOrgInfo` | GET/POST | `users.json` | 当前管户人员下拉 |

需要替换真实接口时，可以优先改 `mockApi.js`，组件层不用动。
