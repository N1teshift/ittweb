import React from 'react';

/**
 * Parses Warcraft 3 color codes and renders colored text
 * 
 * Color codes:
 * - |cffRRGGBB - Start color (RR = red, GG = green, BB = blue in hex, format is cff + 6 hex digits)
 * - |cAARRGGBB - Start color with alpha (AA = alpha, RRGGBB = color, format is c + 8 hex digits)
 * - |r - Reset to default color
 * - |n - Newline
 * 
 * Format examples:
 * - "for |cffFE890D2|r/|cffFE890D8|r seconds" - uses |cff format
 * - "|cFFFFFFC9Tip text|r" - uses |cAARRGGBB format (alpha channel is ignored, only RGB is used)
 */
export function ColoredText({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let currentColor: string | null = null;
  let key = 0;

  // Regex to match color codes: |cAARRGGBB (8 hex digits) or |cffRRGGBB (6 hex digits) or |r or |n
  // Warcraft 3 supports both formats:
  // - |cAARRGGBB where AA is alpha (transparency) and RRGGBB is color
  // - |cffRRGGBB where ff means fully opaque and RRGGBB is color
  const colorCodeRegex = /\|(c[0-9a-fA-F]{8}|cff[0-9a-fA-F]{6}|r|n)/g;
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
    } else if (code.startsWith('c')) {
      // Color code: either |cAARRGGBB (8 hex digits) or |cffRRGGBB (6 hex digits)
      if (code.startsWith('cff') && code.length === 9) {
        // Format: cff + 6 hex digits (RRGGBB)
        const hexColor = code.substring(3); // Skip 'cff' and get RRGGBB
        currentColor = `#${hexColor}`;
      } else if (code.length === 9 && code.startsWith('c') && !code.startsWith('cff')) {
        // Format: c + 8 hex digits (AARRGGBB) - extract RRGGBB (skip AA alpha channel)
        // Example: cFFFFFFC9 -> skip 'c' + 'FF' (alpha), get 'FFFFC9' (RGB)
        const hexColor = code.substring(3); // Skip 'c' + 2 alpha digits, get RRGGBB
        currentColor = `#${hexColor}`;
      }
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


