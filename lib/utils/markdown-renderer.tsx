import React from 'react';

interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'header' | 'list' | 'code' | 'link' | 'lineBreak' | 'paragraph';
  content?: string;
  level?: number;
  children?: MarkdownNode[];
  url?: string;
}

/**
 * Simple markdown parser that converts markdown to React elements
 */
export function parseMarkdown(text: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const lines = text.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Headers (# ## ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      nodes.push({
        type: 'header',
        level,
        children: parseInlineMarkdown(content),
      });
      i++;
      continue;
    }
    
    // Unordered lists (- item)
    if (line.trim().startsWith('- ')) {
      const items: MarkdownNode[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim() === '')) {
        if (lines[i].trim() === '') {
          i++;
          break; // Empty line ends the list
        }
        const itemContent = lines[i].trim().substring(2);
        items.push({
          type: 'list',
          children: parseInlineMarkdown(itemContent),
        });
        i++;
      }
      if (items.length > 0) {
        nodes.push({
          type: 'list',
          children: items,
        });
      }
      continue;
    }
    
    // Code blocks (```code```)
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++; // Skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // Skip closing ```
      nodes.push({
        type: 'code',
        content: codeLines.join('\n'),
      });
      continue;
    }
    
    // Empty line = paragraph break
    if (line.trim() === '') {
      // Only add line break if there are previous nodes
      if (nodes.length > 0 && nodes[nodes.length - 1].type !== 'lineBreak') {
        nodes.push({ type: 'lineBreak' });
      }
      i++;
      continue;
    }
    
    // Regular paragraph
    const inlineNodes = parseInlineMarkdown(line);
    if (inlineNodes.length > 0) {
      nodes.push({
        type: 'paragraph',
        children: inlineNodes,
      });
    }
    i++;
  }
  
  return nodes;
}

/**
 * Parse inline markdown (bold, italic, links, code)
 */
function parseInlineMarkdown(text: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  let i = 0;
  
  while (i < text.length) {
    // Bold (**text**)
    const boldMatch = text.substring(i).match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      nodes.push({
        type: 'bold',
        children: parseInlineMarkdown(boldMatch[1]),
      });
      i += boldMatch[0].length;
      continue;
    }
    
    // Italic (*text*)
    const italicMatch = text.substring(i).match(/^\*(.+?)\*/);
    if (italicMatch && !text.substring(i).startsWith('**')) {
      nodes.push({
        type: 'italic',
        children: parseInlineMarkdown(italicMatch[1]),
      });
      i += italicMatch[0].length;
      continue;
    }
    
    // Inline code (`code`)
    const codeMatch = text.substring(i).match(/^`(.+?)`/);
    if (codeMatch) {
      nodes.push({
        type: 'code',
        content: codeMatch[1],
      });
      i += codeMatch[0].length;
      continue;
    }
    
    // Links [text](url)
    const linkMatch = text.substring(i).match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      nodes.push({
        type: 'link',
        content: linkMatch[1],
        url: linkMatch[2],
      });
      i += linkMatch[0].length;
      continue;
    }
    
    // Regular text
    let textEnd = i;
    while (
      textEnd < text.length &&
      text[textEnd] !== '*' &&
      text[textEnd] !== '`' &&
      text[textEnd] !== '['
    ) {
      textEnd++;
    }
    
    if (textEnd > i) {
      nodes.push({
        type: 'text',
        content: text.substring(i, textEnd),
      });
      i = textEnd;
    } else {
      // Single character that doesn't match any pattern
      nodes.push({
        type: 'text',
        content: text[i],
      });
      i++;
    }
  }
  
  return nodes;
}

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
            <ul key={index} className="list-disc list-inside ml-4 mb-2 space-y-1">
              {node.children.map((item, itemIndex) => (
                <li key={itemIndex} className="ml-2">
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

