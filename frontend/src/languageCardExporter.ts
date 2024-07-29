// Import necessary dependencies
import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';

// Interface for saved items
interface SavedItem {
    sentence: string;
    definition: string;
    audioKey?: string;
    translation?: string;
}

// Interface for audio data storage
interface AudioData {
    [key: string]: string;
}

// Function to convert Markdown to HTML using ReactMarkdown
export function convertMarkdownToHtml(markdown: string): string {
    // Renders the markdown to HTML using ReactMarkdown
    const htmlString = renderToString(
        React.createElement(ReactMarkdown, {}, markdown)
    );
    // Removes the <p> and </p> tags from the resulting HTML string
    return htmlString.replace(/<\/?p>/g, '');
}

// Function to generate a random filename
function generateRandomFilename(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'AssistantLanguages-';
    for (let i = 0; i < 100; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result + '.wav';
}

// Function to handle exporting saved items
export const handleExport = async (savedItems: SavedItem[], audioData: AudioData) => {
    if (savedItems.length === 0) {
        throw new Error('No items to export.');
    }

    // Initialize a new JSZip instance and create an object to store audio filenames
    const zip = new JSZip();
    const audioFilenames: { [key: string]: string } = {};

    // Generate audio filenames for items with audio
    savedItems.forEach((item) => {
        if (item.audioKey && audioData[item.audioKey]) {
            audioFilenames[item.audioKey] = generateRandomFilename();
        }
    });

    // Generate text content from saved items
    // Add the two new lines at the beginning of the text content, making it easier to import into Anki
    let textContent = "#separator:semicolon\n#html:true\n";
    textContent += savedItems.map((item) => {

        // Convert Markdown content to HTML for sentence, definition, and translation
        const sentenceHtml = convertMarkdownToHtml(item.sentence);
        const definitionHtml = convertMarkdownToHtml(item.definition);
        const translationHtml = item.translation ? convertMarkdownToHtml(item.translation) : '';

        // Decode HTML entities
        const decodedSentence = decodeHtmlEntities(sentenceHtml);
        const decodedDefinition = decodeHtmlEntities(definitionHtml);
        const decodedTranslation = decodeHtmlEntities(translationHtml);

        // Use the generated audio filename if audio exists
        const audioFilename = item.audioKey ? audioFilenames[item.audioKey] : '';
        const audioTag = audioFilename ? `[sound:${audioFilename}]` : '';

        // Return the formatted string: Sentence;AudioTag;Definition;Translation
        return `${decodedSentence};${audioTag};${decodedDefinition};${decodedTranslation}`;
    }).join('\n');

    // Get the current date and time, and format it for the filename
    const now = new Date();
    const dateString = formatDateForFilename(now);

    // Add text content to the zip
    zip.file('content.txt', textContent);

    // Add audio files to the zip if they exist
    for (const item of savedItems) {
        if (item.audioKey && audioData[item.audioKey]) {
            // Convert base64 string back to Blob
            const audioBlob = base64ToBlob(audioData[item.audioKey]);
            // Use the generated filename for this audio
            const filename = audioFilenames[item.audioKey];
            zip.file(filename, audioBlob);
        }
    }

    try {
        // Generate the zip file content and create a download link
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);

        const a = document.createElement('a');
        a.href = url;
        // If there's no audio, we'll still use .zip extension but it will only contain the text file
        a.download = `saved_${dateString}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        // Handle any errors that occur during the zip file generation
        console.error('Error generating zip file:', error);
        throw new Error('Failed to generate export file. Please try again.');
    }
};

// Function to format date for filename
// Formats the current date and time in a filename-friendly format (YYYY-MM-DD_HH-MM-SSZ)
function formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const offset = getUTCOffsetString(date);

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}${offset}`;
}

// Function to get UTC offset string
function getUTCOffsetString(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    return `${sign}${hours}${minutes}`;
}

// Function to decode HTML entities
function decodeHtmlEntities(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
