/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_ACTIONS === "true";
const repo = "gemeo.stackup.holdem-heroes";

const nextConfig = {
  allowedDevOrigins: ["192.168.1.5"],
  ...(isPages
    ? {
        output: "export",
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
