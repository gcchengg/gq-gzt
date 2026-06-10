import { lazy, Suspense } from "react";
const Index = lazy(() => import("@/pages/index"));
const GztHome = lazy(() => import("@/pages/gzthome"));
const Assign = lazy(() => import("@/pages/assign"));
const AdviceReview = lazy(() => import("@/pages/adviceReview"));
const AdviceReview1 = lazy(() => import("@/pages/adviceReview1"));
const AdviceReview1Mobile = lazy(() => import("@/pages/adviceReview1Mobile"));
const TopicAdvice = lazy(() => import("@/pages/topicAdvice"));
const TopicAdviceMobile = lazy(() => import("@/pages/topicAdviceMobile"));
const DdMsgMobile = lazy(() => import("@/pages/ddmsgMobile"));
const FollowUp = lazy(() => import("@/pages/followUp"));
const Notfound = lazy(() => import("@/pages/404"));
export const routes = [
  {
    index: true,
    element: (
      <Suspense>
        <Index />
      </Suspense>
    ),
  },
  {
    path: "gzthome",
    element: (
      <Suspense>
        <GztHome />
      </Suspense>
    ),
  },
  {
    path: "GztHome",
    element: (
      <Suspense>
        <GztHome />
      </Suspense>
    ),
  },
  {
    path: "assign",
    element: (
      <Suspense>
        <Assign />
      </Suspense>
    ),
  },
  {
    path: "AdviceReview",
    element: (
      <Suspense>
        <AdviceReview />
      </Suspense>
    ),
  },
  {
    path: "adviceReview1",
    element: (
      <Suspense>
        <AdviceReview1 />
      </Suspense>
    ),
  },
  {
    path: "adviceReview1Mobile",
    element: (
      <Suspense>
        <AdviceReview1Mobile />
      </Suspense>
    ),
  },
  {
    path: "topicAdvice",
    element: (
      <Suspense>
        <TopicAdvice />
      </Suspense>
    ),
  },
  {
    path: "TopicAdviceMobile",
    element: (
      <Suspense>
        <TopicAdviceMobile />
      </Suspense>
    ),
  },
  {
    path: "ddmsgMobile",
    element: (
      <Suspense>
        <DdMsgMobile />
      </Suspense>
    ),
  },
  {
    path: "followUp",
    element: (
      <Suspense>
        <FollowUp />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense>
        <Notfound />
      </Suspense>
    ),
  },
];
export default routes;
