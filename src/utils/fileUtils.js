// utils/fileUtils.js

import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';
import Tesseract from 'tesseract.js';

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

export const readImage = async (file) => {
  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log(m),
    });
    const text = result.data.text;
    console.log('Extracted text from image:', text);
    return text;
  } catch (error) {
    console.error('Error reading image file:', error);
    throw new Error('Failed to read the image file.');
  }
};

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
      console.log('PDF files are not supported.');
      throw new Error('PDF files are not supported at this time.');
    } else if (
      type?.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await readDOCX(file);
    } else if (type?.mime.startsWith('image/')) {
      return await readImage(file);
    } else if (type?.mime === 'text/plain') {
      return await readPlainText(file);
    } else {
      console.log('Unsupported file type.');
      throw new Error('Unsupported file type.');
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