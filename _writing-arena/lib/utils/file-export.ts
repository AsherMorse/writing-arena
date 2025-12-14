/**
 * File export utilities
 * Provides reusable functions for exporting content to files
 */

/**
 * Export text content to a downloadable file
 * 
 * @param content - The text content to export
 * @param filename - The name of the file (without extension)
 * @param mimeType - The MIME type of the file (default: 'text/plain')
 */
export function exportToFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export conversation messages to a text file
 * 
 * @param messages - Array of messages with role and content
 * @param filename - The name of the file (default: includes current date)
 * @param roleLabels - Optional mapping of roles to display names (default: 'user' -> 'You', 'assistant' -> 'Coach')
 */
export function exportConversation(
  messages: Array<{ role: string; content: string; timestamp: Date | string }>,
  filename?: string,
  roleLabels: Record<string, string> = { user: 'You', assistant: 'Coach' }
): void {
  const conversationText = messages.map(msg => {
    const role = roleLabels[msg.role] || msg.role;
    const date = msg.timestamp instanceof Date 
      ? msg.timestamp.toLocaleString() 
      : new Date(msg.timestamp).toLocaleString();
    return `[${date}] ${role}:\n${msg.content}\n`;
  }).join('\n---\n\n');
  
  const defaultFilename = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
  exportToFile(conversationText, filename || defaultFilename);
}

