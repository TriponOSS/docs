import { DocsPager } from "@/components/docs-pager";
import { DocsRail } from "@/components/docs-rail";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap">
      <div className="docs">
        <DocsRail />
        <div className="docs-main">
          <article className="prose">{children}</article>
          <DocsPager />
        </div>
      </div>
    </div>
  );
}
