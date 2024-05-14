import { useState } from 'react';

const useTextToSpeech = () => {
    const [audioUrl, setAudioUrl] = useState(null);

    const synthesizeSpeech = async (text) => {
        const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;  // Ensure this is set in your environment securely
        const url = "https://texttospeech.googleapis.com/v1/text:synthesize";
        const body = {
            input: {text: text},
            voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
            audioConfig: {audioEncoding: 'MP3'},
        };

        try {
            const response = await fetch(`${url}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to synthesize speech');
            }

            const data = await response.json();
            const audioContent = data.audioContent;
            const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], {type: 'audio/mp3'});
            const audioSrc = URL.createObjectURL(audioBlob);
            setAudioUrl(audioSrc);
        } catch (error) {
            console.error('Error in synthesizing speech:', error);
            setAudioUrl(null);
        }
    };

    return { audioUrl, synthesizeSpeech };
};

export default useTextToSpeech;
