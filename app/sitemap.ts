import type { MetadataRoute } from "next";

import { docsNav, site } from "@/lib/site";

/** Every route the site publishes: the landing page, then the docs in reading order. */
export default function sitemap(): MetadataRoute.Sitemap {
  const docs = docsNav.flatMap((group) => group.items);

  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docs.map((item) => ({
      url: `${site.url}${item.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}