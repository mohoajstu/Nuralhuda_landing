import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const parseMarkdown = (markdownText) => {
  const html = marked(markdownText); // Convert Markdown text to HTML
  const cleanHtml = DOMPurify.sanitize(html); // Sanitize the HTML
  return cleanHtml; // Return the sanitized HTML
};

export const RenderMarkdown = ({ markdown }) => {
  if (!markdown) return null;
  const renderedHtml = parseMarkdown(markdown); // Use the sanitized HTML
  return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
};