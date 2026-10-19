import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/evidence", "/ask", "/counts", "/method", "/about", "/privacy", "/terms", "/cookies"].map((p) => ({ url: `${SITE.url}${p}` }));
}
