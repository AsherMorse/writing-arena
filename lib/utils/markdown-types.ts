/**
 * Type definitions for markdown parsing and rendering
 */

export interface MarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'header' | 'list' | 'code' | 'link' | 'lineBreak' | 'paragraph';
  content?: string;
  level?: number;
  children?: MarkdownNode[];
  url?: string;
}

