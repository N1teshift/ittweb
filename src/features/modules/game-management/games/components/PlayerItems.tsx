import React from 'react';
import { Tooltip } from '@/features/infrastructure/components';
import { getItemsByReplayIds } from '@/features/modules/content/guides/data/items';
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
                        return (
                            <div
                                key={`empty-${index}`}
                                className="w-8 h-8 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center"
                                title="Empty slot"
                            />
                        );
                    }

                    const itemData = getItemsByReplayIds([itemId]);
                    const item = itemData[0];
                    
                    if (!item) {
                        return (
                            <div
                                key={`unknown-${index}`}
                                className="w-8 h-8 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center"
                                title="Unknown item"
                            />
                        );
                    }

                    const iconPath = item.iconPath || getItemIconPathFromRecord(item);
                    const iconUrl = iconPath ? `/images/icons/${iconPath}` : null;

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
                const iconUrl = iconPath ? `/images/icons/${iconPath}` : null;

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
