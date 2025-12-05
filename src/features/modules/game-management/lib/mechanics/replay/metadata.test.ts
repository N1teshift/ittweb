import { extractITTMetadata } from './metadata';

describe('extractITTMetadata', () => {
    it('should parse v3 payload correctly (backward compatibility)', () => {
        const mockW3mmdActions = [
            { cache: { key: 'custom itt_version v3.29b' } },
            { cache: { key: 'custom itt_schema 3' } },
            { cache: { key: 'custom itt_chunks 1' } },
            { cache: { key: 'custom itt_data_0 player:0|Player1|ORC|Hunter|1|WIN|1000|500|200|300|50|1|2|3|4|5|6\n' } },
        ];

        const result = extractITTMetadata(mockW3mmdActions);

        expect(result).toBeDefined();
        expect(result?.schema).toBe(3);
        expect(result?.players).toHaveLength(1);
        expect(result?.players[0]).toEqual({
            slotIndex: 0,
            name: 'Player1',
            trollClass: 'Hunter',
            damageTroll: 1000,
            selfHealing: 500,
            allyHealing: 200,
            goldAcquired: 300,
            meatEaten: 50,
            killsElk: 1,
            killsHawk: 2,
            killsSnake: 3,
            killsWolf: 4,
            killsBear: 5,
            killsPanther: 6,
        });
    });

    it('should parse v4 payload with items correctly', () => {
        const mockW3mmdActions = [
            { cache: { key: 'custom itt_version v3.30a' } },
            { cache: { key: 'custom itt_schema 4' } },
            { cache: { key: 'custom itt_chunks 1' } },
            { cache: { key: 'custom itt_data_0 player:1|Player2|HUM|Mage|2|LOSE|2000|100|0|400|20|0|0|0|0|0|0|1001,1002,0,0,1005,0\n' } },
        ];

        const result = extractITTMetadata(mockW3mmdActions);

        expect(result).toBeDefined();
        expect(result?.schema).toBe(4);
        expect(result?.players).toHaveLength(1);
        expect(result?.players[0]).toEqual({
            slotIndex: 1,
            name: 'Player2',
            trollClass: 'Mage',
            damageTroll: 2000,
            selfHealing: 100,
            allyHealing: 0,
            goldAcquired: 400,
            meatEaten: 20,
            killsElk: 0,
            killsHawk: 0,
            killsSnake: 0,
            killsWolf: 0,
            killsBear: 0,
            killsPanther: 0,
            items: [1001, 1002, 0, 0, 1005, 0],
        });
    });

    it('should parse v4 payload with empty items correctly', () => {
        const mockW3mmdActions = [
            { cache: { key: 'custom itt_version v3.30a' } },
            { cache: { key: 'custom itt_schema 4' } },
            { cache: { key: 'custom itt_chunks 1' } },
            { cache: { key: 'custom itt_data_0 player:2|Player3|NE|Scout|1|WIN|500|50|50|100|10|1|1|1|1|1|1|\n' } },
        ];

        const result = extractITTMetadata(mockW3mmdActions);

        expect(result).toBeDefined();
        expect(result?.schema).toBe(4);
        expect(result?.players).toHaveLength(1);
        expect(result?.players[0].items).toEqual([]);
    });
});
