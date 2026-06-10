interface MarkdownBodyProps {
  html: string;
}

export function MarkdownBody({ html }: MarkdownBodyProps) {
  return (
    <div
      className="prose prose-gray dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
        prose-code:font-jetbrains prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-lg
        prose-img:rounded-lg prose-img:my-6
        prose-table:border-collapse
        prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700
        prose-th:px-4 prose-th:py-2
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
        prose-td:px-4 prose-td:py-2
        prose-a:text-blue-600 dark:prose-a:text-blue-400"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
