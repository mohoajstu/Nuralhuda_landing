import Papa from 'papaparse';
import { cleanCSVData, restoreNewlinesInJSON } from './csvUtils';

const processCSV = (files, jsonData) => {
    return new Promise((resolve, reject) => {
        const keys = Object.keys(files);
        let filesProcessed = 0;
        console.log('Starting processCSV');
        console.log('Files:', files);

        keys.forEach((key) => {
            const file = files[key][0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const csvString = event.target.result;
                    console.log('Read file:', key, csvString);
                    const cleanedCSVString = cleanCSVData(csvString);
                    console.log('Cleaned CSV data:', cleanedCSVString);

                    Papa.parse(cleanedCSVString, {
                        header: true,
                        complete: (results) => {
                            console.log('Parsed CSV results:', results);
                            jsonData[key] = restoreNewlinesInJSON(results.data);
                            filesProcessed += 1;
                            console.log('Processed file:', key, jsonData[key]);
                            if (filesProcessed === keys.length) {
                                console.log('All files processed:', jsonData);
                                resolve(jsonData);
                            }
                        },
                        error: (error) => {
                            console.error('Error parsing CSV:', error);
                            reject(error);
                        }
                    });
                } catch (error) {
                    console.error('Error reading file:', error);
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(error);
            };

            console.log('Reading file:', file);
            reader.readAsText(file);
        });
    });
};

export default processCSV;
