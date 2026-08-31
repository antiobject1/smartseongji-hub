import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// GitHub Pages 정적 배포 시 base가 "/smartseongji-hub/"가 되므로
// 라우터 basepath도 빌드 base에 맞춘다 (로컬/Lovable에서는 "/").
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
