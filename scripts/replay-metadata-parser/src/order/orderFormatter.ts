const isAscii = (value: number): boolean => value >= 32 && value <= 126;

export const toOrderString = (raw?: number[]): string | null => {
  if (!raw || raw.length === 0) {
    return null;
  }

  const reversed = [...raw].reverse();
  if (reversed.every(isAscii)) {
    return reversed.map((code) => String.fromCharCode(code)).join("");
  }

  return reversed.map((code) => code.toString(16).padStart(2, "0")).join("");
};


