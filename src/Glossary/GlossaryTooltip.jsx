// GlossaryTooltip.jsx

import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import glossary from './Glossary.json'; // Adjust the path as needed
import './GlossaryTooltip.css'; 
const GlossaryTooltip = ({ name, children }) => {
  const glossaryItem = glossary.find((item) => item.title === name);
  if (!glossaryItem) return children;

  return (
    <Tooltip
      title={
        <Typography variant="body2">
          <strong>{glossaryItem.title}</strong>: {glossaryItem.definition}
          <br />
          <br />
          {/* Optional: Link to open a glossary drawer or page */}
          {/* <a
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => setGlossaryDrawerOpen(true)}
          >
            Open Glossary
          </a> */}
        </Typography>
      }
         arrow
      placement='top-start'
      classes={{ tooltip: 'custom-tooltip' }}
    >
      <span>{children}</span> {/* Wrap children in a span */}
    </Tooltip>
  );
};

export default GlossaryTooltip;

