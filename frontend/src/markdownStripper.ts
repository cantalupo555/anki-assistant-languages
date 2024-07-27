// Function to strip Markdown formatting
export function stripMarkdown(text: string): string {
    // Remove bold and italic formatting
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove links, keeping only the link text
    text = text.replace(/\[([^\]]+)]\([^)]+\)/g, '$1');

    // Remove headers
    text = text.replace(/^#+\s+/gm, '');

    // Remove blockquotes
    text = text.replace(/^>\s+/gm, '');

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove horizontal rules
    text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '');

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Trim whitespace and remove extra newlines
    text = text.trim().replace(/\n{3,}/g, '\n\n');

    return text;
}
