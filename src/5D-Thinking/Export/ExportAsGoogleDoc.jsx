// ExportAsGoogleDoc.jsx
import React from 'react';

/**
 * Helper: Replace underscores with spaces and capitalize each word.
 */
const formatKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Helper: Format an array as bullet points.
 */
const formatArrayAsBullets = (arr) => {
  return arr
    .map(item => {
      if (typeof item === 'object' && item !== null) {
        return formatValue(item);
      }
      return `• ${item}`;
    })
    .join('\n');
};

/**
 * Recursively format a value.
 */
const formatValue = (value) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return formatValue(parsed);
    } catch (e) {
      return value;
    }
  } else if (Array.isArray(value)) {
    return formatArrayAsBullets(value);
  } else if (typeof value === 'object' && value !== null) {
    let result = '';
    Object.keys(value).forEach((key) => {
      if (key.toLowerCase() === 'subtopicindex') return; // Skip unwanted keys
      result += `${formatKey(key)}:\n${formatValue(value[key])}\n\n`;
    });
    return result;
  }
  return '';
};

/**
 * Build a list of batchUpdate requests to insert styled text into the doc.
 */
const buildRequests = (slides) => {
  let requests = [];
  let index = 1; // Google Docs index starts at 1

  // Helper function to insert text with style and update our index.
  const addTextWithStyle = (text, style) => {
    requests.push({
      insertText: {
        location: { index },
        text,
      },
    });
    if (style) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: index, endIndex: index + text.length },
          textStyle: style,
          fields: Object.keys(style).join(','),
        },
      });
    }
    index += text.length;
  };

  // Define common style objects.
  const styles = {
    dimensionTitle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } },
    slideHeader: { bold: true, fontSize: { magnitude: 14, unit: 'PT' } },
    subheading: { bold: true, fontSize: { magnitude: 12, unit: 'PT' } },
    normalText: { fontSize: { magnitude: 11, unit: 'PT' } },
  };

  // Define special styles for the Activities dimension.
  const activitiesStyles = {
    title: { bold: true, fontSize: { magnitude: 16, unit: 'PT' } },
    subheading: { bold: true, fontSize: { magnitude: 13, unit: 'PT' } },
    normalText: { fontSize: { magnitude: 11, unit: 'PT' } },
  };

  // Order in which dimensions are exported.
  const dimensionsOrder = ['Objectives', 'Explore', 'Compare', 'Question', 'Connect', 'Appreciate', 'Activities'];

  dimensionsOrder.forEach((dimension) => {
    // Filter slides for the current dimension.
    const dimensionSlides = slides.filter(slide => slide.dimension === dimension);
    if (dimensionSlides.length > 0) {
      // Insert the Dimension Title and a separator line.
      addTextWithStyle(`\n${dimension}\n`, styles.dimensionTitle);
      addTextWithStyle(`${'-'.repeat(dimension.length)}\n\n`, styles.normalText);

      dimensionSlides.forEach((slide, slideIndex) => {
        // Insert a slide header.
        addTextWithStyle(`Slide ${slideIndex + 1}:\n`, styles.slideHeader);

        // Special handling for the Activities dimension.
        if (dimension.toLowerCase() === 'activities' && slide.activities && Array.isArray(slide.activities)) {
          // Insert an "Activities:" subheading.
          addTextWithStyle(`Activities:\n`, styles.subheading);
          slide.activities.forEach((activity, actIndex) => {
            // For each activity, iterate its keys and apply special styles.
            Object.keys(activity).forEach((key) => {
              // Skip unwanted keys.
              if (key.toLowerCase() === 'subtopicindex') return;
              // Use a larger style for the title.
              if (key.toLowerCase() === 'title') {
                addTextWithStyle(`${formatKey(key)}:\n`, activitiesStyles.title);
                addTextWithStyle(`${formatValue(activity[key])}\n\n`, activitiesStyles.normalText);
              } else {
                // For other keys, use the subheading style.
                addTextWithStyle(`${formatKey(key)}:\n`, activitiesStyles.subheading);
                addTextWithStyle(`${formatValue(activity[key])}\n\n`, activitiesStyles.normalText);
              }
            });
          });
        } else {
          // For non-Activities dimensions, iterate over slide keys.
          Object.keys(slide).forEach((key) => {
            if (key.toLowerCase() === 'subtopicindex') return;
            if (key.toLowerCase() === 'dimension') return;
            // Insert the key as a subheading.
            addTextWithStyle(`${formatKey(key)}:\n`, styles.subheading);
            // Format and insert the corresponding value.
            const valueText = formatValue(slide[key]);
            addTextWithStyle(`${valueText}\n\n`, styles.normalText);
          });
        }
      });
      addTextWithStyle('\n', null);
    }
  });
  return requests;
};

/**
 * Exports the lesson plan to a Google Doc with proper formatting.
 *
 * @param {Array} slides - Array of slide objects.
 */
const exportAsGoogleDoc = async (slides) => {
  if (!slides || slides.length === 0) {
    alert('No lesson plan data to export.');
    return;
  }
  const accessToken = sessionStorage.getItem('googleAuthToken');
  if (!accessToken) {
    alert('You must be logged in with Google to export.');
    return;
  }
  try {
    // Step 1: Create a new Google Doc.
    const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: '5D Lesson Plan' }),
    });
    const createDocData = await createDocResponse.json();
    const documentId = createDocData.documentId;
    console.log(`Document created with ID: ${documentId}`);

    // Step 2: Build the batch update requests with styled text.
    const requests = buildRequests(slides);

    // Step 3: Send the batch update request.
    const batchUpdateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
    await fetch(batchUpdateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    alert(`Lesson plan exported successfully!
View it here: https://docs.google.com/document/d/${documentId}`);
  } catch (error) {
    console.error('Error exporting to Google Docs:', error);
    alert('Failed to export lesson plan to Google Docs.');
  }
};

export default exportAsGoogleDoc;
