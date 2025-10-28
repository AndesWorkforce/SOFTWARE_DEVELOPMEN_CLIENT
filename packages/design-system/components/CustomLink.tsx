import Link from "next/link";
import { usePathname } from "next/navigation";

type CustomLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function CustomLink({ href, children, className }: CustomLinkProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  return (
    <Link href={`/${locale}/${href}`} className={className}>
      {children}
    </Link>
  );
}
