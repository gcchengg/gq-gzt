import { lazy, Suspense } from "react";
const Index = lazy(() => import("@/pages/index"));
const GztHome = lazy(() => import("@/pages/gzthome"));
const Assign = lazy(() => import("@/pages/assign"));
const AdviceReview = lazy(() => import("@/pages/adviceReview"));
const TopicAdvice = lazy(() => import("@/pages/topicAdvice"));
const TopicAdviceMobile = lazy(() => import("@/pages/topicAdviceMobile"));
const Notfound = lazy(() => import("@/pages/404"));
export const routes = [
    {
        index: true,
        element: (<Suspense>
        <Index />
      </Suspense>),
    },
    {
        path: "gzthome",
        element: (<Suspense>
        <GztHome />
      </Suspense>),
    },
    {
        path: "GztHome",
        element: (<Suspense>
        <GztHome />
      </Suspense>),
    },
    {
        path: "assign",
        element: (<Suspense>
        <Assign />
      </Suspense>),
    },
    {
        path: "AdviceReview",
        element: (<Suspense>
        <AdviceReview />
      </Suspense>),
    },
    {
        path: "topicAdvice",
        element: (<Suspense>
        <TopicAdvice />
      </Suspense>),
    },
    {
        path: "TopicAdviceMobile",
        element: (<Suspense>
        <TopicAdviceMobile />
      </Suspense>),
    },
    {
        path: "*",
        element: (<Suspense>
        <Notfound />
      </Suspense>),
    },
];
export default routes;
