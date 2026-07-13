import { lazy, Suspense } from "react";
const Index = lazy(() => import("@/pages/index"));
const GztHome = lazy(() => import("@/pages/gzthome"));
const GztDemo = lazy(() => import("@/pages/gztDemo"));
const Assign = lazy(() => import("@/pages/assign"));
const NewSanhui = lazy(() => import("@/pages/newSanhui"));
const NewSanhuiPreReview = lazy(() => import("@/pages/newSanhuiPreReview"));
const LiveCircle = lazy(() => import("@/pages/liveCircle"));
const PostReport = lazy(() => import("@/pages/liveCircle/postReport"));
const RecommendationLetter = lazy(
  () => import("@/pages/recommendationLetter/pages"),
);
const ThreeMeetingPlan = lazy(() => import("@/pages/threeMeetingPlan"));
const AdviceReview = lazy(() => import("@/pages/adviceReview"));
const AdviceReview1 = lazy(() => import("@/pages/adviceReview1"));
const AdviceReview1Mobile = lazy(() => import("@/pages/adviceReview1Mobile"));
const TopicAdvice = lazy(() => import("@/pages/topicAdvice"));
const TopicAdviceMobile = lazy(() => import("@/pages/topicAdviceMobile"));
const DdMsgMobile = lazy(() => import("@/pages/ddmsgMobile"));
const FollowUp = lazy(() => import("@/pages/followUp"));
const AssignFollowTask = lazy(() => import("@/pages/assignFollowTask"));
const ManagerTasks = lazy(() => import("@/pages/managerTasks"));
const AiPricing = lazy(() => import("@/pages/aiPricing"));
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
    path: "djghome",
    element: (
      <Suspense>
        <GztHome />
      </Suspense>
    ),
  },
  {
    path: "gztDemo",
    element: (
      <Suspense>
        <GztDemo />
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
    path: "newSanhui",
    element: (
      <Suspense>
        <NewSanhui />
      </Suspense>
    ),
  },
  {
    path: "newSanhuiPreReview",
    element: (
      <Suspense>
        <NewSanhuiPreReview />
      </Suspense>
    ),
  },
  {
    path: "liveCircle",
    element: (
      <Suspense>
        <LiveCircle />
      </Suspense>
    ),
  },
  {
    path: "postReport",
    element: (
      <Suspense>
        <PostReport />
      </Suspense>
    ),
  },
  {
    path: "recommendationLetter",
    element: (
      <Suspense>
        <RecommendationLetter />
      </Suspense>
    ),
  },
  {
    path: "threeMeetingPlan",
    element: (
      <Suspense>
        <ThreeMeetingPlan />
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
    path: "managerTasks",
    element: (
      <Suspense>
        <ManagerTasks />
      </Suspense>
    ),
  },
  {
    path: "assignFollowTask",
    element: (
      <Suspense>
        <AssignFollowTask />
      </Suspense>
    ),
  },
  {
    path: "ai-pricing",
    element: (
      <Suspense>
        <AiPricing />
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
