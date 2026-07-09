/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 21:38:08
 * @Last Modified by: mikey.zhaopengey.zhaopeng
 * @Last Modified time: 2024-11-Th 09:17:11
 */
import { lazy } from "react";

export default {
  // webpackChunkName -> webpack 在打包编译时，生成的文件路径(名)，格式：模块名称/用例名称 service/spt1001
  routes: [
    {
      path: "/recommendationLetter", //下发推荐函
      component: lazy(() => import("../pages/index")),
    },
  ],
  public: [],
};
