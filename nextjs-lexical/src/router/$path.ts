const buildSuffix = (url?: {query?: Record<string, string>, hash?: string}) => {
  const query = url?.query;
  const hash = url?.hash;
  if (!query && !hash) return '';
  const search = query ? `?${new URLSearchParams(query)}` : '';
  return `${search}${hash ? `#${hash}` : ''}`;
};

export const pagesPath = {
  "posts": {
    _postId: (postId: string | number) => ({
      $url: (url?: { hash?: string }) => ({ pathname: '/posts/[postId]' as const, query: { postId }, hash: url?.hash, path: `/posts/${postId}${buildSuffix(url)}` })
    })
  },
  $url: (url?: { hash?: string }) => ({ pathname: '/' as const, hash: url?.hash, path: `/${buildSuffix(url)}` })
};

export type PagesPath = typeof pagesPath;

export const staticPath = {
  json: {
    content1711556990871_json: '/json/content1711556990871.json',
    content1711557044543_json: '/json/content1711557044543.json',
    content1711557248645_json: '/json/content1711557248645.json',
    content1711637596704_json: '/json/content1711637596704.json',
    content1711637689393_json: '/json/content1711637689393.json',
    content1711638403832_json: '/json/content1711638403832.json',
    content1711638432012_json: '/json/content1711638432012.json',
    content1711638764048_json: '/json/content1711638764048.json',
    content1711641213279_json: '/json/content1711641213279.json',
    content1711641292669_json: '/json/content1711641292669.json',
    content1711641369452_json: '/json/content1711641369452.json'
  },
  next_svg: '/next.svg',
  vercel_svg: '/vercel.svg'
} as const;

export type StaticPath = typeof staticPath;
