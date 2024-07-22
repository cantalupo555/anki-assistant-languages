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
    a.download = 'saved_sentences_and_definitions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Function to decode HTML entities
function decodeHtmlEntities(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}
