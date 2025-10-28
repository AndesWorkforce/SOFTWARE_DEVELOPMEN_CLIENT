import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

export default createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});
