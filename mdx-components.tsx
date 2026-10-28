import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";

import { Art } from "@/components/art/art";
import { Code, Session } from "@/components/code";

/**
 * Unwrap a fenced block.
 *
 * MDX compiles ```tripon into <pre><code class="language-tripon">…</code></pre>,
 * and a bare <pre> is a terminal, not a page element: no header, no copy
 * control, no token colours. The fence is read here and handed to the site's
 * own Code block instead. A block with no language still unwraps — it just has
 * no title. Anything that is not a plain string body (a component inside a
 * fence) is left alone.
 */
function fence(children: ReactNode): { text: string; lang?: string } | null {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) {
    return null;
  }

  const { className, children: body } = children.props;
  if (typeof body !== "string") return null;

  const lang = /language-([a-z0-9-]+)/.exec(className ?? "")?.[1];
  return { text: body.replace(/\n$/, ""), lang };
}

/**
 * What MDX in this site may use without importing it: the page's own components,
 * so a page is a document and not a list of imports.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", ...props }) =>
      href.startsWith("/") || href.startsWith("#") ? (
        <Link href={href} {...props} />
      ) : (
        <a href={href} rel="noreferrer" {...props} />
      ),
    pre: ({ children, ...props }) => {
      const block = fence(children);
      return block ? (
        <Code code={block.text} title={block.lang} />
      ) : (
        <pre {...props}>{children}</pre>
      );
    },
    Code,
    Session,
    Art,
    ...components,
  };
}
