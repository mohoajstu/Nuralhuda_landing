// QuizExport.js
import jsPDF from 'jspdf';

export const exportToPDF = (quizData, exportWithAnswers) => {
  const doc = new jsPDF();
  let y = 10;
  const lineHeight = 7;
  const questionSpacing = 10;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;
  const fileName = `${quizData.title.replace(/\s+/g, '_')}_${exportWithAnswers === 'answers' ? 'Answers' : 'Questions'}.pdf`;

  const addNewPageIfNeeded = (height) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      return margin;
    }
    return y;
  };

  const writeText = (text, x, maxWidth, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return splitText.length * lineHeight;
  };

  const calculateQuestionHeight = (question, index) => {
    let height = lineHeight * 2;
    if (question.type === 'multiple-choice') {
      height += question.options.length * lineHeight;
    } else if (question.type === 'true-false') {
      height += 2 * lineHeight;
    } else if (question.type === 'fill-in-the-blank') {
      height += lineHeight;
    } else if (question.type === 'matching') {
      height += (question.columnA.length + 1) * lineHeight * 1.5;
    }
    if (exportWithAnswers === 'answers') {
      height += 3 * lineHeight;
    }
    return height + questionSpacing;
  };

  const writeQuestion = (question, index) => {
    const startY = y;
    y += writeText(`Question ${index + 1}: ${question.question || 'Matching:'}`, margin, contentWidth);
    y += lineHeight;

    if (question.type === 'multiple-choice') {
      question.options.forEach((option, i) => {
        y += writeText(`${i + 1}. ${option}`, margin + 5, contentWidth - 5);
      });
    } else if (question.type === 'true-false') {
      y += writeText('1. True', margin + 5, contentWidth - 5);
      y += writeText('2. False', margin + 5, contentWidth - 5);
    } else if (question.type === 'fill-in-the-blank') {
      y += writeText('Answer: __________', margin + 5, contentWidth - 5);
    } else if (question.type === 'matching') {
      y += writeText('Match the following options:', margin, contentWidth);
      y += lineHeight;
      const columnAWidth = contentWidth * 0.45;
      const columnBWidth = contentWidth * 0.45;
      const columnSpacing = contentWidth * 0.1;
      question.columnA.forEach((item, i) => {
        const lineY = y;
        writeText(item, margin, columnAWidth);
        writeText(question.columnB[i], margin + columnAWidth + columnSpacing, columnBWidth);
        y = lineY + lineHeight * 1.5;
      });
    }

    if (exportWithAnswers === 'answers') {
      y += lineHeight * 1.5;
      if (question.type === 'matching') {
        y += writeText('Correct Matches:', margin, contentWidth);
        question.columnA.forEach((item, i) => {
          y += writeText(`${item} - ${question.columnB[question.correctMatches[i]]}`, margin + 10, contentWidth - 10);
        });
      } else {
        y += writeText(`Correct Answer: ${
          question.type === 'true-false' ? (question.correctAnswer ? 'True' : 'False') :
          question.type === 'multiple-choice' ? question.options[question.correctAnswer] :
          question.correctAnswer
        }`, margin, contentWidth);
      }
      y += lineHeight;
      y += writeText(`Explanation: ${question.explanation}`, margin, contentWidth);
    }

    y += questionSpacing;
    return y - startY;
  };

  writeText('Quiz: ' + (quizData.title || 'Untitled Quiz'), margin, contentWidth, 16);
  y += 20;

  quizData.questions.forEach((question, index) => {
    const questionHeight = calculateQuestionHeight(question, index);
    y = addNewPageIfNeeded(questionHeight);
    writeQuestion(question, index);
  });

  doc.save(fileName);
};
