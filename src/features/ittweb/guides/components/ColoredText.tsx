import React from 'react';

/**
 * Parses Warcraft 3 color codes and renders colored text
 * 
 * Color codes:
 * - |cffRRGGBB - Start color (RR = red, GG = green, BB = blue in hex, format is cff + 6 hex digits)
 * - |r - Reset to default color
 * - |n - Newline
 * 
 * Format example: "for |cffFE890D2|r/|cffFE890D8|r seconds"
 * This means: "for " (default), "2" (in color #FE890D), "/" (default), "8" (in color #FE890D), " seconds" (default)
 */
export function ColoredText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let currentColor: string | null = null;
  let key = 0;

  // Regex to match color codes: |cffRRGGBB or |r or |n
  // The format is |cff followed by 6 hex digits (RRGGBB)
  const colorCodeRegex = /\|(cff[0-9a-fA-F]{6}|r|n)/g;
  let match: RegExpExecArray | null;
  const matches: Array<{ index: number; code: string; fullMatch: string }> = [];

  // Collect all matches first
  while ((match = colorCodeRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      code: match[1],
      fullMatch: match[0],
    });
  }

  // Process each match
  for (const matchInfo of matches) {
    const matchIndex = matchInfo.index;
    const code = matchInfo.code;
    const fullMatch = matchInfo.fullMatch;

    // Add text before the code
    if (matchIndex > currentIndex) {
      const textBefore = text.substring(currentIndex, matchIndex);
      if (textBefore) {
        parts.push(
          <span key={key++} style={currentColor ? { color: currentColor } : undefined}>
            {textBefore}
          </span>
        );
      }
    }

    // Process the code
    if (code === 'r') {
      // Reset color
      currentColor = null;
    } else if (code === 'n') {
      // Newline
      parts.push(<br key={key++} />);
    } else if (code.startsWith('cff') && code.length === 9) {
      // Color code: cff + 6 hex digits (RRGGBB)
      const hexColor = code.substring(3); // Skip 'cff' and get RRGGBB
      currentColor = `#${hexColor}`;
    }

    currentIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      parts.push(
        <span key={key++} style={currentColor ? { color: currentColor } : undefined}>
          {remainingText}
        </span>
      );
    }
  }

  // If no color codes were found, return plain text
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className}>{parts}</span>;
}

