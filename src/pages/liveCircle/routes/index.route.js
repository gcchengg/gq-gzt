import { lazy } from 'react';

export default {
  routes: [
    {
      path: '/liveCircle', // 参股公司全生命周期管理
      component: lazy(() => import('../page/index')),
    },
  ],
  public: [],
};
