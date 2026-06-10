export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getPostBreadcrumbs(
  category: string,
  postTitle: string
): BreadcrumbItem[] {
  return [
    { name: "首页", url: "/" },
    { name: "博客", url: "/blog" },
    { name: category, url: `/blog/${category}` },
    { name: postTitle, url: "#" },
  ];
}

export function getCategoryBreadcrumbs(category: string): BreadcrumbItem[] {
  return [
    { name: "首页", url: "/" },
    { name: "博客", url: "/blog" },
    { name: category, url: `/blog/${category}` },
  ];
}
