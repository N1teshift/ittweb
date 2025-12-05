
function intToFourCC(value: number): string {
    let result = '';
    for (let i = 3; i >= 0; i--) {
        const charCode = (value >> (8 * i)) & 0xFF;
        result += String.fromCharCode(charCode);
    }
    return result.split('').reverse().join(''); // Wait, standard FourCC is big-endian usually? Or little-endian?
    // Let's try standard approach
}

function intToFourCC_Standard(value: number): string {
    return String.fromCharCode(
        (value >> 24) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 8) & 0xFF,
        value & 0xFF
    );
}

const ids = [
    1229795951,
    1229795705,
    1229795705,
    1229795705,
    1229796385,
    1229795951
];

console.log('IDs conversion:');
ids.forEach(id => {
    console.log(`${id} -> ${intToFourCC_Standard(id)}`);
});
