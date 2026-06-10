/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPO_NAME || "blog";

const nextConfig = {
  output: "export",

  // GitHub Pages project site 需要 basePath（即 username.github.io/仓库名/）
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}` : "",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
