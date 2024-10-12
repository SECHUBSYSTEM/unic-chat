import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

interface ResponseRendererProps {
  content: string;
  isUser: boolean;
}

const MAX_VISIBLE_CHARS = 300;

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  content,
  isUser,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const cleanContent = (text: string) => {
    if (isUser) {
      return text.replace(/<\/?p>/g, "").trim();
    }
    // to remove tags
    return text
      .replace(
        /<\|startoftext\|>|<\|end\|>|<\|endofanswer\|>|<\|endofdocument\|>|<\|endoftext\|>/g,
        ""
      )
      .replace(/<bgcolor="#[^"]*">/g, "")
      .replace(/\[\[[^\]]*\]\]/g, "")
      .replace(/\{\{[^}]*\}\}/g, "")
      .replace(/<\/?p>/g, "")
      .replace(/<<[^>]*>>/g, "")
      .replace(/\*\*AI Assistant\*\*/g, "")
      .replace(/<li class="[^"]*">/g, "<li>") // Remove custom classes from list items
      .replace(/<ul role="none" aria-expanded='false'>/g, "<ul>") // Remove custom attributes from ul
      .trim();
  };

  const cleanedContent = cleanContent(content);
  const shouldTruncate = cleanedContent.length > MAX_VISIBLE_CHARS;
  const displayContent = isExpanded
    ? cleanedContent
    : cleanedContent.slice(0, MAX_VISIBLE_CHARS);

  return (
    <div
      className={`w-full max-w-3xl sm:max-w-[80%] mx-auto my-4 p-4 rounded-lg shadow-md ${
        isUser ? "bg-blue-100" : "bg-gray-100 dark:bg-gray-500 text-white"
      }`}
    >
      <div className="prose max-w-none">
        {isUser ? (
          <p className="text-gray-800">{displayContent}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    {...(props as SyntaxHighlighterProps)}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: "1em 0",
                      borderRadius: "0.375rem",
                      padding: "1em",
                      overflowX: "auto",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={`${className} bg-gray-200 rounded px-1 py-0.5`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {displayContent}
          </ReactMarkdown>
        )}
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};
