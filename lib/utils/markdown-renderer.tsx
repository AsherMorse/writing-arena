import React from 'react';
import { MarkdownNode } from './markdown-types';
import { parseMarkdown } from './markdown-parser';

/**
 * Render markdown nodes as React elements
 */
export function renderMarkdown(nodes: MarkdownNode[]): React.ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <span key={index}>{node.content}</span>;
      
      case 'bold':
        return (
          <strong key={index} className="font-bold">
            {node.children && renderMarkdown(node.children)}
          </strong>
        );
      
      case 'italic':
        return (
          <em key={index} className="italic">
            {node.children && renderMarkdown(node.children)}
          </em>
        );
      
      case 'header':
        const HeaderTag = `h${Math.min(node.level || 1, 6)}` as keyof JSX.IntrinsicElements;
        const headerClasses = {
          1: 'text-2xl font-bold mb-3 mt-4',
          2: 'text-xl font-bold mb-2 mt-3',
          3: 'text-lg font-bold mb-2 mt-2',
        }[node.level || 1] || 'text-base font-bold mb-1 mt-1';
        
        return (
          <HeaderTag key={index} className={headerClasses}>
            {node.children && renderMarkdown(node.children)}
          </HeaderTag>
        );
      
      case 'list':
        // Check if children are list items (they should all be 'list' type nodes)
        if (node.children && node.children.length > 0) {
          return (
            <ul key={index} className="list-disc pl-6 mb-2 space-y-2">
              {node.children.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  {item.children && renderMarkdown(item.children)}
                </li>
              ))}
            </ul>
          );
        }
        return null;
      
      case 'code':
        if (node.content && node.content.includes('\n')) {
          // Code block
          return (
            <pre key={index} className="bg-white/10 rounded p-3 my-2 overflow-x-auto">
              <code className="text-sm font-mono">{node.content}</code>
            </pre>
          );
        }
        // Inline code
        return (
          <code key={index} className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono">
            {node.content}
          </code>
        );
      
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            {node.content}
          </a>
        );
      
      case 'lineBreak':
        return <br key={index} />;
      
      case 'paragraph':
        return (
          <p key={index} className="mb-2 last:mb-0">
            {node.children && renderMarkdown(node.children)}
          </p>
        );
      
      default:
        return null;
    }
  });
}

/**
 * Main function to convert markdown text to React elements
 */
export function MarkdownRenderer({ content }: { content: string }): React.ReactElement {
  const nodes = parseMarkdown(content);
  return <>{renderMarkdown(nodes)}</>;
}
