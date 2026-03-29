import type { SourceInfo, SourceType } from "./types";

const SOCIAL_HOST_HINTS = [
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "reddit.com",
  "tiktok.com",
  "youtube.com"
];

const NEWS_HOST_HINTS = [
  "nytimes.com",
  "cnn.com",
  "bbc.",
  "reuters.com",
  "apnews.com",
  "washingtonpost.com",
  "theguardian.com",
  "bloomberg.com",
  "wsj.com"
];

const TECHNICAL_HOST_HINTS = [
  "github.com",
  "gitlab.com",
  "stackoverflow.com",
  "developer.",
  "docs.",
  "readthedocs.io",
  "npmjs.com",
  "kubernetes.io",
  "mozilla.org"
];

function inferType(hostname: string, url: string, title: string): SourceType {
  const host = hostname.toLowerCase();
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();

  if (SOCIAL_HOST_HINTS.some((hint) => host.includes(hint))) {
    return "social";
  }

  if (TECHNICAL_HOST_HINTS.some((hint) => host.includes(hint))) {
    return "technical";
  }

  if (
    NEWS_HOST_HINTS.some((hint) => host.includes(hint)) ||
    urlLower.includes("/news/") ||
    urlLower.includes("/world/") ||
    titleLower.includes("breaking")
  ) {
    return "news_article";
  }

  if (
    urlLower.includes("/blog/") ||
    urlLower.includes("/posts/") ||
    titleLower.includes("blog") ||
    titleLower.includes("newsletter")
  ) {
    return "blog";
  }

  return "general";
}

function inferDomainHint(hostname: string, type: SourceType): string {
  const host = hostname.toLowerCase();

  if (host.includes("github.com")) return "code hosting and software collaboration";
  if (host.includes("stackoverflow.com")) return "developer Q&A and technical troubleshooting";
  if (host.includes("reddit.com")) return "community discussion and mixed-quality opinions";
  if (host.includes("x.com") || host.includes("twitter.com")) return "short-form social commentary";
  if (host.includes("youtube.com")) return "video platform context";
  if (host.includes("wikipedia.org")) return "encyclopedia-style reference content";

  const domainRoot = host.split(".").slice(-2).join(".");
  switch (type) {
    case "social":
      return `social platform content on ${domainRoot}`;
    case "news_article":
      return `news reporting on ${domainRoot}`;
    case "technical":
      return `technical documentation or engineering content on ${domainRoot}`;
    case "blog":
      return `opinion or blog-style post on ${domainRoot}`;
    default:
      return `general web content on ${domainRoot}`;
  }
}

export function detectSource(hostname: string, url: string, pageTitle: string): SourceInfo {
  const sourceType = inferType(hostname, url, pageTitle);
  const domainHint = inferDomainHint(hostname, sourceType);
  return { sourceType, domainHint };
}
