import { LanguageSwitcher } from "@/packages/design-system";

export default function UnauthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Language Switcher en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
