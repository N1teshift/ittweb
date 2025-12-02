import { ReplayMetaError, ReplayMetaErrorCode } from "../errors.js";
import type { MatchMetadataSpec, ReplayOrderEvent } from "../types.js";

/**
 * Extract metadata order IDs from replay events.
 * 
 * The metadata encoder issues orders rapidly at the end of the match.
 * We detect the metadata stream by finding a sequence of known order IDs
 * issued in quick succession (within the encoding interval).
 */
export const extractMetadataOrderIds = (
  events: ReplayOrderEvent[],
  spec: MatchMetadataSpec,
  debug = false
): string[] => {
  const knownOrders = new Set(spec.symbolOrderStrings);

  if (debug) {
    const uniqueOrders = [...new Set(events.map((e) => e.orderId))];
    const uniquePlayerIds = [...new Set(events.map((e) => e.playerId))].sort((a, b) => a - b);
    console.error("[DEBUG] Total events:", events.length);
    console.error("[DEBUG] Unique order IDs:", uniqueOrders.length);
    console.error("[DEBUG] Player IDs seen:", uniquePlayerIds);
    console.error("[DEBUG] Sample orders:", uniqueOrders.slice(0, 20));
    console.error("[DEBUG] Expected orders (first 10):", spec.symbolOrderStrings.slice(0, 10));
  }

  // Filter events that match our known order IDs
  const matchingEvents = events.filter((event) => knownOrders.has(event.orderId));

  if (debug) {
    console.error("[DEBUG] Events matching known orders:", matchingEvents.length);
  }

  if (matchingEvents.length === 0) {
    throw new ReplayMetaError(
      "Metadata order stream not found",
      ReplayMetaErrorCode.STREAM_NOT_FOUND,
      { totalEvents: events.length }
    );
  }

  // Find the longest consecutive sequence of matching orders
  // (metadata encoding happens in rapid succession at ~50ms intervals)
  const sequences = findOrderSequences(matchingEvents, 200); // 200ms max gap
  
  if (debug) {
    console.error("[DEBUG] Found sequences:", sequences.length);
    sequences.forEach((seq, i) => {
      console.error(`[DEBUG]   Sequence ${i}: ${seq.length} orders`);
    });
  }

  // Use the longest sequence as the metadata stream
  const longestSequence = sequences.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    [] as ReplayOrderEvent[]
  );

  const filtered = longestSequence.map((event) => event.orderId);

  if (debug) {
    console.error("[DEBUG] Matched orders (longest sequence):", filtered.length);
  }

  if (filtered.length === 0) {
    throw new ReplayMetaError(
      "Metadata order stream not found",
      ReplayMetaErrorCode.STREAM_NOT_FOUND,
      { totalEvents: events.length }
    );
  }

  return filtered;
};

/**
 * Group events into sequences based on time gaps.
 * Events within maxGapMs of each other are considered part of the same sequence.
 */
function findOrderSequences(
  events: ReplayOrderEvent[],
  maxGapMs: number
): ReplayOrderEvent[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.timestampMs - b.timestampMs);
  const sequences: ReplayOrderEvent[][] = [];
  let currentSequence: ReplayOrderEvent[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestampMs - sorted[i - 1].timestampMs;
    if (gap <= maxGapMs) {
      currentSequence.push(sorted[i]);
    } else {
      sequences.push(currentSequence);
      currentSequence = [sorted[i]];
    }
  }

  sequences.push(currentSequence);
  return sequences;
}

