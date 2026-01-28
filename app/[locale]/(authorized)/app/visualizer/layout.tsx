import { Sidebar } from "@/packages/design-system";

export default function VisualizerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF", color: "#000000" }}>
      <Sidebar role="visualizer" />
      <main className="flex-1 md:ml-60 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
