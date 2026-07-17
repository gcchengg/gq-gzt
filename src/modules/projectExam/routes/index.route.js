import { lazy } from "react";

export default {
  routes: [
    {
      path: "/projectExam", // 考试
      component: lazy(() => import("../pages/index.jsx")),
    },
  ],
  public: [],
};
