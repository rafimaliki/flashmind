"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h1: ({ children }: any) => (
            <h1 className="text-2xl font-bold text-zinc-100 mb-4 mt-6 first:mt-0 pb-2 border-b border-zinc-700">
              {children}
            </h1>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h2: ({ children }: any) => (
            <h2 className="text-xl font-semibold text-zinc-100 mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h3: ({ children }: any) => (
            <h3 className="text-lg font-semibold text-zinc-200 mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          h4: ({ children }: any) => (
            <h4 className="text-base font-semibold text-zinc-200 mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          p: ({ children }: any) => (
            <p className="text-zinc-300 mb-3 leading-relaxed">{children}</p>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ul: ({ children }: any) => (
            <ul className="list-disc pl-5 text-zinc-300 mb-3 space-y-1">
              {children}
            </ul>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ol: ({ children }: any) => (
            <ol className="list-decimal pl-5 text-zinc-300 mb-3 space-y-1">
              {children}
            </ol>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          li: ({ children }: any) => (
            <li className="text-zinc-300 leading-relaxed">{children}</li>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-indigo-600 pl-4 py-1 mb-3 text-zinc-400 italic bg-indigo-950/30 rounded-r-lg">
              {children}
            </blockquote>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pre: ({ children }: any) => (
            <pre className="bg-zinc-950 rounded-xl p-4 overflow-x-auto mb-4 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: ({ children, className }: any) => {
            const isBlock = !!className || String(children).includes("\n");
            if (isBlock) {
              return (
                <code className={`font-mono text-zinc-200 ${className ?? ""}`}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-zinc-800 text-rose-400 px-1.5 py-0.5 rounded text-[0.85em] font-mono">
                {children}
              </code>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          table: ({ children }: any) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-zinc-700">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thead: ({ children }: any) => (
            <thead className="bg-zinc-800">{children}</thead>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tr: ({ children }: any) => (
            <tr className="border-b border-zinc-700 last:border-0">
              {children}
            </tr>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          th: ({ children }: any) => (
            <th className="text-left px-4 py-2.5 font-semibold text-zinc-300">
              {children}
            </th>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          td: ({ children }: any) => (
            <td className="px-4 py-2.5 text-zinc-400">{children}</td>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          a: ({ href, children }: any) => (
            <a
              href={href}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              target="_blank"
              rel="noreferrer noopener"
            >
              {children}
            </a>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hr: (_: any) => <hr className="border-zinc-700 my-5" />,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          strong: ({ children }: any) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          em: ({ children }: any) => (
            <em className="italic text-zinc-300">{children}</em>
          ),
          img: (
            { src, alt }: any, // eslint-disable-line @typescript-eslint/no-explicit-any
          ) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? ""}
              className="max-w-full rounded-lg my-3 border border-zinc-700"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
