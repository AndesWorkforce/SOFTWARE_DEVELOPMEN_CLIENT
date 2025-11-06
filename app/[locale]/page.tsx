import { redirect } from "next/navigation";

export default function LocaleIndex({ params }: { params: { locale: string } }) {
  // Redirect directly to login
  redirect(`/${params.locale}/login`);
}
