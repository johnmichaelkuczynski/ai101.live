import { useEffect } from "react";

const SITE = "Teach Yourself AI";
const BASE_URL = "https://ai101.ink";

/**
 * Per-route SEO: sets the document title, meta description, and canonical
 * URL. Search engines that execute JS (Google, Bing) pick these up per page;
 * the static index.html shell carries strong defaults for the rest.
 */
export function useSeo(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — Learn How Artificial Intelligence Works`;

    if (description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.name = "description";
        document.head.appendChild(el);
      }
      el.content = description;
    }

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const path = window.location.pathname;
    canonical.href = `${BASE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
  }, [title, description]);
}
