import React from 'react';
import { marked } from 'marked';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

const removeAnnotations = (text) => {
  // Remove anything between 【 and 】
  const pattern = /【[^】]*】/g;
  return text.replace(pattern, '');
};

const parseMarkdown = (markdownText) => {
  const cleanedText = removeAnnotations(markdownText);
  const html = marked(cleanedText);
  const cleanHtml = DOMPurify.sanitize(html);
  return cleanHtml;
};

export const RenderMarkdown = ({ markdown }) => {
  const html = parseMarkdown(markdown);
  return <>{parse(html)}</>;
};
