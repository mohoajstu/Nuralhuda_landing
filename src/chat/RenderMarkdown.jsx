import React from 'react';
import { marked } from 'marked';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const removeAnnotations = (text) => {
  const pattern = /【\d+†source】/g;
  return text.replace(pattern, '');
};

const parseMarkdown = (markdownText) => {
  const cleanedText = removeAnnotations(markdownText); // Remove unwanted annotations
  const html = marked(cleanedText); // Convert cleaned Markdown text to HTML
  const cleanHtml = DOMPurify.sanitize(html); // Sanitize the HTML
  return cleanHtml; // Return the sanitized HTML
};

export const RenderMarkdown = ({ markdown }) => {
  const html = parseMarkdown(markdown); // Parse Markdown to HTML
  return <>{parse(html)}</>; // Return as JSX
};
