import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface ResponseRendererProps {
  content: string;
  isUser: boolean;
}

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  content,
  isUser,
}) => {
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
      .replace(/<<[^>]*>>/g, "")
      .replace(/\*\*AI Assistant\*\*/g, "")
      .replace(/<li class="[^"]*">/g, "<li>") // Remove custom classes from list items
      .replace(/<ul role="none" aria-expanded='false'>/g, "<ul>") // Remove custom attributes from ul
      .trim();
  };

  const cleanedContent = cleanContent(content);

  return isUser ? (
    <p>{cleanedContent}</p>
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
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {cleanedContent}
    </ReactMarkdown>
  );
};
