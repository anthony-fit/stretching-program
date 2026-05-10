import { onRequestGet as __api_all_exercises_ts_onRequestGet } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\all-exercises.ts"
import { onRequestPost as __api_generate_composition_ts_onRequestPost } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\generate-composition.ts"
import { onRequestPost as __api_generate_script_ts_onRequestPost } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\generate-script.ts"
import { onRequestPost as __api_generate_seo_ts_onRequestPost } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\generate-seo.ts"
import { onRequestPost as __api_generate_social_ts_onRequestPost } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\generate-social.ts"
import { onRequestPost as __api_generate_video_ts_onRequestPost } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\generate-video.ts"
import { onRequestGet as __api_get_stretch_ts_onRequestGet } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\get-stretch.ts"
import { onRequestGet as __api_proxy_gif_ts_onRequestGet } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\api\\proxy-gif.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\Anthony\\Downloads\\stretching-pro\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/all-exercises",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_all_exercises_ts_onRequestGet],
    },
  {
      routePath: "/api/generate-composition",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_composition_ts_onRequestPost],
    },
  {
      routePath: "/api/generate-script",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_script_ts_onRequestPost],
    },
  {
      routePath: "/api/generate-seo",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_seo_ts_onRequestPost],
    },
  {
      routePath: "/api/generate-social",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_social_ts_onRequestPost],
    },
  {
      routePath: "/api/generate-video",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_video_ts_onRequestPost],
    },
  {
      routePath: "/api/get-stretch",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_stretch_ts_onRequestGet],
    },
  {
      routePath: "/api/proxy-gif",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_proxy_gif_ts_onRequestGet],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]