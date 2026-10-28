import type { Metadata } from "next";
import Link from "next/link";

import { Art } from "@/components/art/art";
import { NotFoundTerm } from "@/components/not-found-term";
import { site, topNav } from "@/lib/site";

export const metadata: Metadata = {
  title: "No such page",
  description: "This address is not part of the Tripon documentation tree.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <Art
        piece="big-text"
        options={{ text: "404" }}
        max="21px"
        bare
        label="404"
        className="notfound-art"
      />

      <h1>No such page.</h1>

      <p className="notfound-lede">
        The docs tree is finite, and this is not part of it. Everything the project
        publishes hangs off the index, and every diagnostic the compiler can emit has
        a page of its own.
      </p>

      <NotFoundTerm />

      <p className="notfound-note">
        404 is this site&rsquo;s own code, not one of the compiler&rsquo;s:{" "}
        <code>ralt explain E0404</code> has nothing to say about it.
      </p>

      <nav className="notfound-routes" aria-label="Where to go instead">
        <Link href="/">[home]</Link>
        {topNav.map((item) => (
          <Link key={item.href} href={item.href}>
            [{item.label}]
          </Link>
        ))}
        <Link href={site.repo}>[github]</Link>
      </nav>
    </div>
  );
}