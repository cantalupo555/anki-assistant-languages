import React from 'react';
import { renderToString } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

export function convertMarkdownToHtml(markdown: string): string {
    // Renders the markdown to HTML using ReactMarkdown
    const htmlString = renderToString(
        React.createElement(ReactMarkdown, {}, markdown)
    );
    // Removes the <p> and </p> tags from the resulting HTML string
    return htmlString.replace(/<\/?p>/g, '');
}

// Function to handle exporting saved items
export const handleExport = (savedItems: { sentence: string; definition: string }[]) => {
    if (savedItems.length === 0) {
        alert('No items to export.');
        return;
    }

    const exportContent = savedItems.map(item => {
        const sentenceHtml = convertMarkdownToHtml(item.sentence);
        const definitionHtml = convertMarkdownToHtml(item.definition);

        // Decode HTML entities
        const decodedSentence = decodeHtmlEntities(sentenceHtml);
        const decodedDefinition = decodeHtmlEntities(definitionHtml);

        return `${decodedSentence};${decodedDefinition}`;
    }).join('\n');

    // Changed the type to 'text/plain' to ensure .txt output
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate a filename with the current local date and time in ISO 8601 format, including UTC offset
    const now = new Date();
    const dateString = formatDateForFilename(now);
    a.download = `saved_${dateString}.txt`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Function to format date for filename
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
