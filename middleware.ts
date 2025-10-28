export { default } from "./packages/internationalization/middleware";

export const config = {
  // Skip _next, static files, and allow API routes
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
