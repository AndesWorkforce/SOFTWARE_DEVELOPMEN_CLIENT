import { Sidebar, Header } from "@/packages/design-system";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF", color: "#000000" }}>
      <Sidebar role="client" />
      <Header userName="User" />
      <main className="flex-1 md:ml-60 pb-16 md:pb-0 pt-[55px]">{children}</main>
    </div>
  );
}
