// utils/fileUtils.js

import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';

export const readDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: text } = await mammoth.extractRawText({ arrayBuffer });
    console.log('Extracted text from DOCX:', text);
    return text;
  } catch (error) {
    console.error('Error reading DOCX file:', error);
    throw new Error('Failed to read the DOCX file.');
  }
};

/*
export const readPDF = async (file) => {
  // You can add PDF processing logic here
  console.log('PDF files are not supported yet.');
  throw new Error('PDF file reading is not supported yet.');
};
*/

export const readPlainText = async (file) => {
  try {
    const text = await file.text();
    console.log('Plain text file content:', text);
    return text;
  } catch (error) {
    console.error('Error reading plain text file:', error);
    throw new Error('Failed to read the text file.');
  }
};

export const readFileContent = async (file) => {
  try {
    console.log('Reading file:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const type = await fileTypeFromBuffer(uint8Array);

    console.log('Detected file type:', type);

    if (type?.mime === 'application/pdf') {
      // Uncomment if PDF support is added
      // return await readPDF(file);
      throw new Error('PDF files are not supported yet.');
    } else if (type?.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await readDOCX(file);
    } else {
      return await readPlainText(file);
    }
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Failed to read the file.');
  }
};

  
/*
  const readPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let text = '';
    for (const page of pages) {
      const textContent = await page.getTextContent();
      text += textContent.items.map((item) => item.str).join(' ');
    }
    return text;
  };
  */
