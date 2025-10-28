import { redirect } from "next/navigation";
import { routing } from "@andes/internationalization/routing";

// Redirect root '/' to the default locale. This also satisfies Next's
// generated type validators that expect an app/page.tsx at the root.
export default function RootRedirect() {
  redirect(`/${routing.defaultLocale}`);
}
