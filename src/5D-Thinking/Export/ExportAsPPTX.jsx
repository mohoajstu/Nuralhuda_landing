import PptxGenJS from 'pptxgenjs';


const getContentText = (slideContent) => {
    if (slideContent.dimension === 'Objectives') {
      // Convert the `learningObjectives` object into a bullet list of categories and items
      const lo = slideContent.learningObjectives || {};
      let bulletString = '';
      for (const [category, items] of Object.entries(lo)) {
        bulletString += `${capitalizeWords(category)}:\n`;
        items.forEach((obj) => {
          bulletString += ` - ${obj}\n`;
        });
        bulletString += '\n';
      }
      return bulletString;
    }
  
  if (slideContent.dimension === 'Question') {
    // If it's one of the first 3 subtopics, we have questions (an array)
    if (
      slideContent.subtopicIndex < 3 &&
      Array.isArray(slideContent.questions) &&
      slideContent.questions.length > 0
    ) {
      // Join them with newline so it looks like bullet points in a text box
      return slideContent.questions.join('\n');
    }
    // If it's subtopicIndex 3, it's the conclusion
    if (slideContent.subtopicIndex === 3 && slideContent.conclusion) {
      // Prepend a label if you want
      return  slideContent.conclusion;
    }
  }

// Check for other keys
const keys = Object.keys(slideContent);
for (const key of keys) {
  // Skip dimension, subtopicIndex, questionCategory, questions already handled
  if (
    ['dimension', 'subtopicIndex', 'questionCategory', 'questions', 'allahNames', 'zikrFikrShukr'].includes(key)
  ) {
    continue;
  }
  if (slideContent[key]) {
    if (Array.isArray(slideContent[key])) {
      return slideContent[key].join('\n');
    } else if (typeof slideContent[key] === 'string') {
      return slideContent[key];
    }
  }
}
return '';
};

const capitalizeWords = (text = '') => {
    return text
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
const base64ImageString = process.env.REACT_APP_BASE64_IMAGE_STRING;

const dimensionColors = {
    Objectives: '0070C0',
    Explore: 'fa6666',
    Compare: '000000',
    Question: '64aae8',
    Connect: 'ffa600',
    Appreciate: '35b8b1',
    Activities: 'ffcccb',
  };
  
const titleSubtopicMap = {
    Objectives: ['Learning Objectives'],
    Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
    Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
    Question: ['Negation of Chance', 'Negation of Material Causes', 'Negation of Nature', 'Conclusion'],
    Connect: ['Interdependency', 'Interconnectedness', "Allah's Names"],
    Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith', 'Dua'],
    Activities: ['Explore', 'Compare', 'Question', 'Connect', 'Appreciate'],
  };
  
const exportSlidesAsPptx = (slides) => {
    
    const pptx = new PptxGenJS();
  
    // Initialize subtopicIndex to 0 for each dimension
    const subtopicIndexes = {
      Objectives: 0,
      Explore: 0,
      Compare: 0,
      Question: 0,
      Connect: 0,
      Appreciate: 0,
    };
  
    slides.forEach((slideContent) => {
        const dimension = slideContent.dimension;
    
        // Handle "Activities" dimension differently
        if (dimension === 'Activities') {
          const activities = slideContent.activities || [];
    
          activities.forEach((activity) => {
            const activitySlide = pptx.addSlide(); // Create a new slide for each activity
    
            // Add the colored title bar across the top
            activitySlide.addShape(pptx.ShapeType.rect, {
              x: 0.5,
              y: 0.3,
              w: 9,
              h: 0.7,
              fill: { color: dimensionColors[activity.dimension] || '000000' },
              line: { color: 'FFFFFF' },
              radius: 10,
            });
    
            activitySlide.addText(`Activity - ${activity.dimension}: ${activity.title}`, {
              x: 0.5,
              y: 0.3,
              w: 9,
              h: 0.7,
              fontSize: 25,
              bold: true,
              color: 'FFFFFF',
              align: 'center',
              valign: 'middle',
            });
    
            let yOffset = 1.5;
    
            // Add the objective
            activitySlide.addText(`Objective: ${activity.objective}`, {
              x: 0.7,
              y: yOffset,
              w: 8.6,
              fontSize: 18,
              color: '000000',
              align: 'left',
            });
            yOffset += 0.6;
    
            // Add materials
            if (activity.materials?.length > 0) {
              activitySlide.addText('Materials:', {
                x: 0.7,
                y: yOffset,
                w: 8.6,
                fontSize: 16,
                bold: true,
                color: '000000',
                align: 'left',
              });
              yOffset += 0.4;
    
              activitySlide.addText(activity.materials.join('\n'), {
                x: 1.0,
                y: yOffset,
                w: 8.3,
                fontSize: 14,
                color: '000000',
                align: 'left',
              });
              yOffset += 0.5 + activity.materials.length * 0.2;
            }
    
            // Add instructions
            if (activity.instructions?.length > 0) {
              activitySlide.addText('Instructions:', {
                x: 0.7,
                y: yOffset-0.2,
                w: 8.6,
                fontSize: 16,
                bold: true,
                color: '000000',
                align: 'left',
              });
              yOffset += 0.3;
    
              activitySlide.addText(activity.instructions.join('\n'), {
                x: 1.0,
                y: yOffset+0.2,
                w: 8.3,
                fontSize: 14,
                color: '000000',
                align: 'left',
              });
            }
    
            // Add the logo
            activitySlide.addImage({
              x: 8.5,
              y: 0.3,
              w: 0.7,
              h: 0.7,
              data: base64ImageString,
            });
          });
    
          return; // Skip the rest of the loop for "Activities" dimension
        }
  
      // ─────────────────────────────────────────────────────────  
      const slide = pptx.addSlide();

  
      // Get subtopic index and increment
      const subtopicIndex = subtopicIndexes[dimension];
      subtopicIndexes[dimension]++;
  
      // Title text
      const subtopic = titleSubtopicMap[dimension][subtopicIndex] || 'Output';
  
      // ─────────────────────────────────────────────────────────
      // 1) Draw the colored title bar across the top
      // ─────────────────────────────────────────────────────────
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,       // 0.5 inch from left
        y: 0.3,       // 0.3 inch from top
        w: 9,         // 9 inches wide
        h: 0.7,       // 0.7 inch tall
        fill: { color: dimensionColors[dimension] },
        line: { color: 'FFFFFF' },
        radius: 10,   // Rounded corners
      });
  
      slide.addText(`${dimension} - ${subtopic}`, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.7,
        fontSize: 30,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });

      // ─────────────────────────────────────────────────────────
      // 2) If it's the Objectives dimension, do a custom layout.
      //    Otherwise, check contentText or special cases.
      // ─────────────────────────────────────────────────────────
      if (dimension === 'Objectives') {
        const learningObjectives = slideContent.learningObjectives || {};
  
        // Flatten all objective arrays into one
        const bulletPoints = Object.values(learningObjectives)
          .flat()
          .filter((obj) => obj.trim().length > 0);
  
        // Intro text
        slide.addText('After this lesson, learners will be able to:', {
          x: 0.7,
          y: 1.2,       
          w: 8.6,
          fontSize: 20,
          bold: true,
          color: '000000',
          align: 'left',
        });
  
        if (bulletPoints.length > 0) {
          // Add bullet list
          slide.addText(bulletPoints.join('\n'), {
            x: 0.7,
            y: 1.8,
            w: 8.6,
            h: 3.5,
            fontSize: 18,
            color: '000000',
            align: 'left',
            bullet: true,
            autoFit: true,
          });
        } else {
          slide.addText('No learning objectives available.', {
            x: 1,
            y: 2,
            w: 8,
            fontSize: 20,
            color: '000000',
            align: 'center',
          });
        }
  
      } else {
        // ─────────────────────────────────────────────────────────
        // 3) Check if we have (Appreciate => connectWithQuran/hadith/dua)
        //    or just generic contentText. Then handle the table cases.
        // ─────────────────────────────────────────────────────────
  
        //
        // --- 3a) If dimension is "Appreciate" with connectWithQuran:
        //
        if (dimension === 'Appreciate' && slideContent.connectWithQuran) {
          // Build a single text block for multiple Quran entries
          const quranTextArr = slideContent.connectWithQuran.map(({ verse, translation, explanation }) => {
            return (
              `Verse:\n${verse}\n\n` +
              `Translation:\n"${translation}"\n\n` +
              `Explanation:\n${explanation}\n\n` 
            );
          });
  
          // Also append any "dua" if present
          let duaText = '';
          if (slideContent.dua && slideContent.dua.trim().length > 0) {
            duaText = `\nDua:\n${slideContent.dua}\n`;
          }
  
          slide.addText(quranTextArr.join('') + duaText, {
            x: 0.7,
            y: 1.2,
            w: 8.6,
            h: 3.5,
            fontSize: 20,
            color: '000000',
            align: 'left',
            valign: 'top',
            autoFit: true,
          });
  
        //
        // --- 3b) If dimension is "Appreciate" with connectWithHadith:
        //
        } else if (dimension === 'Appreciate' && slideContent.connectWithHadith) {
          // Build a single text block for multiple Hadith entries
          const hadithTextArr = slideContent.connectWithHadith.map(({ hadith, explanation }) => {
            return (
              `Hadith:\n"${hadith}"\n\n` +
              `Explanation:\n${explanation}\n\n` 
            );
          });
  
          // Also append any "dua" if present
          let duaText = '';
          if (slideContent.dua && slideContent.dua.trim().length > 0) {
            duaText = `\nDua:\n${slideContent.dua}\n`;
          }
  
          slide.addText(hadithTextArr.join('') + duaText, {
            x: 0.7,
            y: 1.2,
            w: 8.6,
            h: 3.5,
            fontSize: 20,
            color: '000000',
            align: 'left',
            valign: 'top',
            autoFit: true,
          });
  
        //
        // --- 3c) If "Appreciate" has no Quran/Hadith but has a "dua" alone:
        //
        } else if (dimension === 'Appreciate' && slideContent.dua) {
          slide.addText(`Dua:\n${slideContent.dua}`, {
            x: 0.7,
            y: 1.2,
            w: 8.6,
            h: 3.5,
            fontSize: 20,
            color: '000000',
            align: 'left',
            valign: 'top',
            autoFit: true,
          });
  
        //
        // --- 3d) Otherwise, check if there's generic contentText:
        //
        } 
         else {
          const contentText = getContentText(slideContent);
  
          // If generic contentText is non-empty
          if (contentText && contentText.trim() !== '') {
            slide.addText(contentText, {
              x: 0.7,
              y: 1.2,
              w: 8.6,
              h: 3.5,
              fontSize: 20,
              color: '000000',
              align: 'center',
              valign: 'middle',
              autoFit: true,  
            });
          } else {
            // 4) Otherwise check for Connect or Appreciate tables
            if (dimension === 'Connect' && slideContent.allahNames) {
              const { whatItTells, namesInEnglish, namesInArabic } = slideContent.allahNames;
              const tableData = [
                ['What it tells us about Allah', 'Names in English', 'Names in Arabic'],
                ...whatItTells.map((item, idx) => [
                  item,
                  namesInEnglish[idx],
                  namesInArabic[idx],
                ]),
              ];
              slide.addTable(tableData, {
                x: 0.7,
                y: 1.5,
                w: 8.6,
                fontSize: 14,
                color: '000000',
                align: 'center',
              });
  
            } else if (dimension === 'Appreciate' && slideContent.zikrFikrShukr) {
              const { zikr, fikr, shukr } = slideContent.zikrFikrShukr;
              const tableData = [
                ['Zikr', 'Fikr', 'Shukr'],
                ...zikr.map((item, idx) => [item, fikr[idx], shukr[idx]]),
              ];
              slide.addTable(tableData, {
                x: 0.7,
                y: 1.8,
                w: 8.6,
                fontSize: 14,
                color: '000000',
                align: 'center',
              });
            }
          }
        }
      }
  
      // ─────────────────────────────────────────────────────────
      // 5) Set background color and add your logo
      // ─────────────────────────────────────────────────────────
      slide.background = { fill: 'FFFFFF' };
  
      slide.addImage({
        x: 8.5,
        y: 0.3,
        w: 0.7,
        h: 0.7,
        data: base64ImageString,
      });
    });
  
    pptx.writeFile({ fileName: '5D_Lesson_Plan.pptx' });
  };

  export default exportSlidesAsPptx;