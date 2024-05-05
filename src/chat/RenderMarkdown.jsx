import React from 'react';
import { marked } from 'marked';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const parseMarkdown = (markdownText) => {
  const html = marked(markdownText); // Convert Markdown text to HTML
  const cleanHtml = DOMPurify.sanitize(html); // Sanitize the HTML
  return cleanHtml; // Return the sanitized HTML
};

export const RenderMarkdown = ({ markdown }) => {
  const html = parseMarkdown(markdown); // Parse Markdown to HTML
  return <>{parse(html)}</>; // Return as JSX
};