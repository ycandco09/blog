import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export interface Heading {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export async function renderMarkdown(mdContent: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(mdContent);

  return String(result.value);
}

export function extractHeadings(html: string): Heading[] {
  const regex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]) as 1 | 2 | 3 | 4,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, "").trim(),
    });
  }

  return headings;
}
