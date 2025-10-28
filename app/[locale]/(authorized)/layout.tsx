import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthorizedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    redirect(`/${(await params).locale}/login`);
  }
  return <>{children}</>;
}
