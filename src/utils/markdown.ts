export const stripMarkdown = (text: string): string => {
  return text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove links
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  const stripped = stripMarkdown(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + '...';
};

export const getFirstLine = (text: string): string => {
  const stripped = stripMarkdown(text);
  const firstLine = stripped.split('\n')[0];
  return firstLine || 'Untitled';
};

export const wordCount = (text: string): number => {
  const stripped = stripMarkdown(text);
  const words = stripped.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
};

export const readingTime = (text: string): number => {
  const words = wordCount(text);
  // Average reading speed: 200 words per minute
  return Math.ceil(words / 200);
};

export const extractHeadings = (text: string): string[] => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(text)) !== null) {
    headings.push(match[2]);
  }

  return headings;
};

export const extractLinks = (text: string): { text: string; url: string }[] => {
  const linkRegex = /\[(.+?)\]\((.+?)\)/g;
  const links: { text: string; url: string }[] = [];
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }

  return links;
};
