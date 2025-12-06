import React from 'react';
import { Tooltip } from '@/features/infrastructure/components';
import { getItemsByReplayIds, getItemByReplayId } from '@/features/modules/content/guides/data/items';
import { getItemIconPathFromRecord } from '@/features/modules/content/guides/data/items';

interface PlayerItemsProps {
    items?: number[];
    className?: string;
    showEmptySlots?: boolean; // If true, show empty slots (gray boxes) for items that are 0 or missing
}

/**
 * Display player inventory items as icons with tooltips
 */
export function PlayerItems({ items, className = '', showEmptySlots = false }: PlayerItemsProps) {
    // If showEmptySlots is true, we show slots (even if empty) when items array exists
    if (showEmptySlots && items !== undefined) {
        // Ensure we have 6 slots (typical inventory size)
        const slots = items || [];
        const paddedSlots = [...slots];
        while (paddedSlots.length < 6) {
            paddedSlots.push(0);
        }

        return (
            <div className={`flex gap-1 flex-wrap ${className}`}>
                {paddedSlots.slice(0, 6).map((itemId, index) => {
                    const isEmpty = !itemId || itemId === 0;
                    
                    if (isEmpty) {
                        // Show empty material slot icon
                        const emptySlotIconUrl = '/icons/itt/BTNResourcesPack.png';
                        return (
                            <Tooltip key={`empty-${index}`} content="Empty slot">
                                <div className="w-8 h-8 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center overflow-hidden">
                                    <img
                                        src={emptySlotIconUrl}
                                        alt="Empty slot"
                                        className="w-full h-full object-cover opacity-50"
                                        onError={(e) => {
                                            // Fallback to gray box if icon fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </Tooltip>
                        );
                    }

                    // Use getItemByReplayId to get individual item (doesn't filter zeros)
                    const item = getItemByReplayId(itemId);
                    
                    if (!item) {
                        // Unknown item - show placeholder
                        return (
                            <Tooltip key={`unknown-${index}`} content={`Unknown item (ID: ${itemId})`}>
                                <div className="w-8 h-8 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-500">?</span>
                                </div>
                            </Tooltip>
                        );
                    }

                    const iconPath = item.iconPath || getItemIconPathFromRecord(item);
                    // iconPath from getItemIconPathFromRecord already includes /icons/itt/ prefix
                    // If item.iconPath is just a filename, we need to construct the full path
                    const iconUrl = iconPath 
                        ? (iconPath.startsWith('/') ? iconPath : `/icons/itt/${iconPath}`)
                        : null;

                    return (
                        <Tooltip key={`${item.id}-${index}`} content={item.name}>
                            <div className="w-8 h-8 bg-amber-900/30 border border-amber-500/30 rounded flex items-center justify-center overflow-hidden">
                                {iconUrl ? (
                                    <img
                                        src={iconUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback to text if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            if (target.nextSibling) {
                                                (target.nextSibling as HTMLElement).style.display = 'block';
                                            }
                                        }}
                                    />
                                ) : null}
                                <span
                                    className="text-xs text-amber-400 font-bold"
                                    style={{ display: iconUrl ? 'none' : 'block' }}
                                >
                                    {item.name.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        );
    }

    // Original behavior: only show items if they exist
    if (!items || items.length === 0) {
        return <span className="text-gray-600">-</span>;
    }

    const itemData = getItemsByReplayIds(items);

    if (itemData.length === 0) {
        return <span className="text-gray-600">-</span>;
    }

    return (
        <div className={`flex gap-1 flex-wrap ${className}`}>
            {itemData.map((item, index) => {
                const iconPath = item.iconPath || getItemIconPathFromRecord(item);
                // iconPath from getItemIconPathFromRecord already includes /icons/itt/ prefix
                // If item.iconPath is just a filename, we need to construct the full path
                const iconUrl = iconPath 
                    ? (iconPath.startsWith('/') ? iconPath : `/icons/itt/${iconPath}`)
                    : null;

                return (
                    <Tooltip key={`${item.id}-${index}`} content={item.name}>
                        <div className="w-8 h-8 bg-amber-900/30 border border-amber-500/30 rounded flex items-center justify-center overflow-hidden">
                            {iconUrl ? (
                                <img
                                    src={iconUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to text if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.nextSibling) {
                                            (target.nextSibling as HTMLElement).style.display = 'block';
                                        }
                                    }}
                                />
                            ) : null}
                            <span
                                className="text-xs text-amber-400 font-bold"
                                style={{ display: iconUrl ? 'none' : 'block' }}
                            >
                                {item.name.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                    </Tooltip>
                );
            })}
        </div>
    );
}
