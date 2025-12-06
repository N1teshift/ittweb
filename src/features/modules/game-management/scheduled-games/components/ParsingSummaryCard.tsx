import React, { useState } from 'react';
import type { ParsingSummary } from '@/features/modules/game-management/lib/mechanics/replay/types';

interface ParsingSummaryCardProps {
  summary: ParsingSummary;
}

export function ParsingSummaryCard({ summary }: ParsingSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasWarnings = summary.warnings.length > 0;

  return (
    <div className="bg-gray-800 border border-amber-500/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-300">Parsing Summary</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors text-sm"
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Players</div>
          <div className="text-lg font-semibold text-amber-300">{summary.gameData.playersDetected}</div>
        </div>
        <div className="bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">With Stats</div>
          <div className="text-lg font-semibold text-green-400">{summary.gameData.playersWithITTStats}</div>
        </div>
        <div className="bg-gray-900/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Winners</div>
          <div className="text-lg font-semibold text-green-400">{summary.gameData.winners}</div>
        </div>
      </div>

      {/* Metadata Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {summary.metadata.w3mmdFound ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-400">W3MMD data found ({summary.metadata.w3mmdActionCount} actions)</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-yellow-400">W3MMD data not found</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {summary.metadata.ittMetadataFound ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-400">
                ITT metadata found
                {summary.metadata.ittSchemaVersion && ` (Schema v${summary.metadata.ittSchemaVersion})`}
                {summary.metadata.ittVersion && ` - ${summary.metadata.ittVersion}`}
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-yellow-400">ITT metadata not found - using fallback data</span>
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium text-yellow-300">Warnings</span>
          </div>
          <ul className="space-y-1">
            {summary.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-200 flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Player Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Players:</span>
                <span className="text-amber-300">{summary.gameData.playersDetected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">With Stats:</span>
                <span className="text-green-400">{summary.gameData.playersWithStats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">With ITT Stats:</span>
                <span className="text-green-400">{summary.gameData.playersWithITTStats}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Winners:</span>
                <span className="text-green-400">{summary.gameData.winners}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Losers:</span>
                <span className="text-red-400">{summary.gameData.losers}</span>
              </div>
              {summary.gameData.drawers > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Draws:</span>
                  <span className="text-yellow-400">{summary.gameData.drawers}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Metadata Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">W3MMD Actions:</span>
                <span className={summary.metadata.w3mmdFound ? 'text-green-400' : 'text-yellow-400'}>
                  {summary.metadata.w3mmdActionCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ITT Metadata:</span>
                <span className={summary.metadata.ittMetadataFound ? 'text-green-400' : 'text-yellow-400'}>
                  {summary.metadata.ittMetadataFound ? 'Found' : 'Not Found'}
                </span>
              </div>
              {summary.metadata.ittSchemaVersion && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Schema Version:</span>
                  <span className="text-amber-300">v{summary.metadata.ittSchemaVersion}</span>
                </div>
              )}
              {summary.metadata.ittVersion && (
                <div className="flex justify-between">
                  <span className="text-gray-400">ITT Version:</span>
                  <span className="text-amber-300">{summary.metadata.ittVersion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
