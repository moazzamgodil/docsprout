import path from "node:path";

export const normalizeSlug = (input: string): string => {
  const noExt = input.replace(/\.(md|mdx)$/i, "");
  const clean = noExt
    .replace(/README$/i, "index")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");

  return clean === "" ? "index" : clean;
};

export const relativeUnixPath = (root: string, fullPath: string): string =>
  path.relative(root, fullPath).split(path.sep).join("/");

