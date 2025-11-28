/**
 * Markdown parsing utilities
 * Converts markdown text into structured node trees
 */

import { MarkdownNode } from './markdown-types';

/**
 * Parse markdown text into a tree of nodes
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
export function parseInlineMarkdown(text: string): MarkdownNode[] {
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

