export function cleanCSVData(csvString) {
    const newlinePlaceholder = '<NEWLINE>';
    const cleanedCSVString = csvString.replace(/"(.*?)"/gs, (match, p1) => {
        return '"' + p1.replace(/\n/g, newlinePlaceholder) + '"';
    });
    console.log('Cleaned CSV data:', cleanedCSVString);
    return cleanedCSVString;
}

export function restoreNewlinesInJSON(jsonData) {
    const newlinePlaceholder = '<NEWLINE>';

    function traverseAndRestore(obj) {
        if (typeof obj === 'string') {
            return obj.replace(new RegExp(newlinePlaceholder, 'g'), '\n');
        } else if (Array.isArray(obj)) {
            return obj.map(traverseAndRestore);
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj = {};
            for (const key in obj) {
                newObj[key] = traverseAndRestore(obj[key]);
            }
            return newObj;
        }
        return obj;
    }

    console.log('Restored newlines in JSON data:', jsonData);
    return traverseAndRestore(jsonData);
}
