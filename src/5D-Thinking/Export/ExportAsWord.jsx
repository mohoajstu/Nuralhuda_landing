// ExportAsWord.jsx
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

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
 * Helper: Recursively format a value as plain text.
 */
const formatValue = (value) => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return formatValue(parsed);
    } catch (e) {
      return value;
    }
  } else if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === "object" ? formatValue(item) : `• ${item}`))
      .join("\n");
  } else if (typeof value === "object" && value !== null) {
    let result = "";
    Object.keys(value).forEach((key) => {
      if (key.toLowerCase() === "subtopicindex") return; // Skip unwanted keys
      result += `${formatKey(key)}:\n${formatValue(value[key])}\n\n`;
    });
    return result;
  }
  return "";
};

/**
 * Build docx Paragraphs from the slides data.
 */
const buildParagraphs = (slides) => {
  const paragraphs = [];
  const dimensionsOrder = [
    "Objectives",
    "Explore",
    "Compare",
    "Question",
    "Connect",
    "Appreciate",
    "Activities",
  ];

  dimensionsOrder.forEach((dimension) => {
    // Filter slides for the current dimension.
    const dimensionSlides = slides.filter(
      (slide) => slide.dimension === dimension
    );
    if (dimensionSlides.length > 0) {
      // Insert Dimension Title (Heading 1).
      paragraphs.push(
        new Paragraph({
          text: dimension,
          heading: HeadingLevel.HEADING_1,
        })
      );
      // Add a separator line.
      paragraphs.push(
        new Paragraph({
          text: "-".repeat(dimension.length),
        })
      );

      dimensionSlides.forEach((slide, slideIndex) => {
        // Insert Slide header (Heading 2).
        paragraphs.push(
          new Paragraph({
            text: `Slide ${slideIndex + 1}:`,
            heading: HeadingLevel.HEADING_2,
          })
        );

        // Special handling for Activities dimension.
        if (
          dimension.toLowerCase() === "activities" &&
          slide.activities &&
          Array.isArray(slide.activities)
        ) {
          // Insert an "Activities:" subheading.
          paragraphs.push(
            new Paragraph({
              text: "Activities:",
              heading: HeadingLevel.HEADING_3,
            })
          );
          slide.activities.forEach((activity) => {
            Object.keys(activity).forEach((key) => {
              if (key.toLowerCase() === "subtopicindex") return;
              if (key.toLowerCase() === "title") {
                paragraphs.push(
                  new Paragraph({
                    text: `${formatKey(key)}:`,
                    heading: HeadingLevel.HEADING_3,
                  })
                );
                paragraphs.push(
                  new Paragraph({
                    text: formatValue(activity[key]),
                  })
                );
              } else {
                paragraphs.push(
                  new Paragraph({
                    text: `${formatKey(key)}:`,
                    heading: HeadingLevel.HEADING_4,
                  })
                );
                paragraphs.push(
                  new Paragraph({
                    text: formatValue(activity[key]),
                  })
                );
              }
            });
          });
        } else {
          // For non-Activities dimensions, loop through each key.
          Object.keys(slide).forEach((key) => {
            if (key.toLowerCase() === "subtopicindex") return;
            if (key.toLowerCase() === "dimension") return;
            paragraphs.push(
              new Paragraph({
                text: `${formatKey(key)}:`,
                heading: HeadingLevel.HEADING_3,
              })
            );
            paragraphs.push(
              new Paragraph({
                text: formatValue(slide[key]),
              })
            );
          });
        }
        // Add an empty paragraph for spacing between slides.
        paragraphs.push(new Paragraph({ text: "" }));
      });
      // Add an extra spacing paragraph after the dimension.
      paragraphs.push(new Paragraph({ text: "" }));
    }
  });
  return paragraphs;
};

/**
 * Exports the lesson plan to a Word document (.docx).
 *
 * @param {Array} slides - Array of slide objects.
 */
export const exportAsWord = async (slides) => {
  if (!slides || slides.length === 0) {
    alert("No lesson plan data to export.");
    return;
  }

  // Create a new Document with a single section.
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: buildParagraphs(slides),
      },
    ],
  });

  // Convert the Document to a Blob.
  const blob = await Packer.toBlob(doc);

  // Trigger the file download using FileSaver.
  saveAs(blob, "LessonPlan.docx");
};

export default exportAsWord;
