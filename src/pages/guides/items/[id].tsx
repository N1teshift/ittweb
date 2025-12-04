import { GetStaticPaths, GetStaticProps } from 'next';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary, Section } from '@/features/infrastructure/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ITEMS_DATA, getItemById } from '@/features/modules/content/guides/data/items';
import { ABILITIES, getAbilityById } from '@/features/modules/content/guides/data/abilities';
import { getAbilitySlugFromRawId, findAbilitySlugByRawId } from '@/features/modules/content/guides/data/items/abilityIdMapper';
import { ALL_UNITS } from '@/features/modules/content/guides/data/units/allUnits';
import { ItemData } from '@/types/items';
import { ColoredText } from '@/features/modules/content/guides/components/ColoredText';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';

type Props = { item: ItemData };

const pageNamespaces = ["common"];

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: ITEMS_DATA.map((item) => ({ params: { id: item.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const id = String(params?.id || '');
  const item = getItemById(id);
  if (!item) {
    return { notFound: true };
  }
  const base = await getStaticPropsWithTranslations(pageNamespaces)({ locale: locale as string });
  return {
    props: {
      ...base.props,
      item,
    },
  };
};

function StatBadge({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) {
  return (
    <span className={`text-xs ${colorClass} px-2 py-1 rounded`}>{label}: {value}</span>
  );
}

export default function ItemDetailPage({ item }: Props) {
  const router = useRouter();
  const categoryParam = router.query.category as string;
  
  // Build back link with category if provided
  const backHref = categoryParam && categoryParam !== 'all'
    ? `/guides/items?category=${categoryParam}`
    : '/guides/items';

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={backHref} className="link-amber">← Items Overview</Link>
        </div>

        <header className="mb-6">
          <h1 className="font-medieval-brand text-2xl md:text-4xl mb-2 text-amber-400">{item.name}</h1>
          {item.tooltip ? (
            <div className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              <ColoredText text={item.tooltip} />
            </div>
          ) : (
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              <ColoredText text={item.description} />
            </p>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Section variant="medieval">
            <h2 className="font-medieval-brand text-2xl mb-3">Details</h2>
            <div className="space-y-2 text-gray-300">
              <div>
                <span className="text-gray-400">Category:</span>{' '}
                <span className="text-amber-300 capitalize">{item.category.replace('-', ' ')}</span>
              </div>
              {item.subcategory && (
                <div>
                  <span className="text-gray-400">Subcategory:</span>{' '}
                  <span className="text-amber-300 capitalize">{item.subcategory.replace('-', ' ')}</span>
                </div>
              )}
              {item.craftedAt && (() => {
                // Normalize both names for comparison (remove apostrophes, lowercase, trim spaces)
                const normalizeName = (name: string) => 
                  name.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ').trim();
                
                const craftedAtNormalized = normalizeName(item.craftedAt);
                
                // Find the building/unit by matching the craftedAt name
                const building = ALL_UNITS.find(
                  unit => {
                    const unitNameNormalized = normalizeName(unit.name);
                    return unitNameNormalized === craftedAtNormalized ||
                           (item.craftedAt && unit.name.toLowerCase() === item.craftedAt.toLowerCase());
                  }
                );
                
                if (building) {
                  // Use raw ID - Next.js Link will handle encoding automatically
                  // This matches the pattern used in src/pages/guides/units.tsx
                  // Add query parameters to enable back navigation
                  return (
                    <div>
                      <span className="text-gray-400">Crafted at:</span>{' '}
                      <Link 
                        href={`/guides/units/${encodeURIComponent(building.id)}?from=item&itemId=${item.id}`}
                        className="text-blue-300 hover:text-blue-200 underline transition-colors"
                      >
                        {item.craftedAt}
                      </Link>
                    </div>
                  );
                }
                
                // Fallback: show as plain text if building not found
                return (
                  <div>
                    <span className="text-gray-400">Crafted at:</span>{' '}
                    <span className="text-blue-300">{item.craftedAt}</span>
                  </div>
                );
              })()}
              {item.mixingPotManaRequirement && (
                <div>
                  <span className="text-gray-400">Mana cost:</span>{' '}
                  <span className="text-purple-300">{item.mixingPotManaRequirement} mana</span>
                </div>
              )}
              {item.cost !== undefined && item.cost > 0 && (
                <div>
                  <span className="text-gray-400">Gold cost:</span>{' '}
                  <span className="text-yellow-300">{item.cost} gold</span>
                </div>
              )}
              {item.lumberCost !== undefined && item.lumberCost > 0 && (
                <div>
                  <span className="text-gray-400">Lumber cost:</span>{' '}
                  <span className="text-green-300">{item.lumberCost} lumber</span>
                </div>
              )}
              {item.hotkey && (
                <div>
                  <span className="text-gray-400">Hotkey:</span>{' '}
                  <span className="text-amber-300 font-mono">{item.hotkey}</span>
                </div>
              )}
              {item.uses !== undefined && item.uses > 0 && (
                <div>
                  <span className="text-gray-400">Charges:</span>{' '}
                  <span className="text-blue-300">{item.uses}</span>
                </div>
              )}
              {item.hitPoints !== undefined && item.hitPoints > 0 && (
                <div>
                  <span className="text-gray-400">Durability:</span>{' '}
                  <span className="text-red-300">{item.hitPoints} HP</span>
                </div>
              )}
              {item.maxStack !== undefined && item.maxStack > 0 && (
                <div>
                  <span className="text-gray-400">Max stack:</span>{' '}
                  <span className="text-purple-300">{item.maxStack}</span>
                </div>
              )}
            </div>
          </Section>

          <Section variant="medieval">
            <h2 className="font-medieval-brand text-2xl mb-3">Stats</h2>
            {item.stats ? (
              <div className="flex flex-wrap gap-2">
                {typeof item.stats.damage === 'number' && (
                  <StatBadge label="Damage" value={item.stats.damage} colorClass="bg-red-500/20 text-red-200" />
                )}
                {typeof item.stats.armor === 'number' && (
                  <StatBadge label="Armor" value={item.stats.armor} colorClass="bg-blue-500/20 text-blue-200" />
                )}
                {typeof item.stats.health === 'number' && (
                  <StatBadge label="Health" value={`+${item.stats.health}`} colorClass="bg-green-500/20 text-green-200" />
                )}
                {typeof item.stats.mana === 'number' && (
                  <StatBadge label="Mana" value={`+${item.stats.mana}`} colorClass="bg-purple-500/20 text-purple-200" />
                )}
                {typeof item.stats.strength === 'number' && (
                  <StatBadge label="Strength" value={`+${item.stats.strength}`} colorClass="bg-orange-500/20 text-orange-200" />
                )}
                {typeof item.stats.agility === 'number' && (
                  <StatBadge label="Agility" value={`+${item.stats.agility}`} colorClass="bg-green-500/20 text-green-200" />
                )}
                {typeof item.stats.intelligence === 'number' && (
                  <StatBadge label="Intelligence" value={`+${item.stats.intelligence}`} colorClass="bg-blue-500/20 text-blue-200" />
                )}
                {typeof item.stats.attackSpeed === 'number' && (
                  <StatBadge label="Attack Speed" value={`+${item.stats.attackSpeed}%`} colorClass="bg-yellow-500/20 text-yellow-200" />
                )}
                {(item.stats.other || []).map((eff, i) => (
                  <span key={i} className="text-xs bg-green-500/20 text-green-200 px-2 py-1 rounded">{eff}</span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No stats available.</p>
            )}
          </Section>
          
          {item.abilities && item.abilities.length > 0 && (
            <Section variant="medieval">
              <h2 className="font-medieval-brand text-2xl mb-3">Abilities</h2>
              <div className="flex flex-wrap gap-3">
                {item.abilities.map((rawAbilityId, i) => {
                  // Try to map raw ability ID to ability slug
                  let abilitySlug = getAbilitySlugFromRawId(rawAbilityId);
                  
                  // If not found in direct mapping, try to find by searching
                  if (!abilitySlug) {
                    abilitySlug = findAbilitySlugByRawId(rawAbilityId, ABILITIES.map(ab => ({ id: ab.id, name: ab.name })));
                  }
                  
                  // Get the ability if we found a slug
                  const ability = abilitySlug ? getAbilityById(abilitySlug) : null;
                  
                  if (ability) {
                    return (
                      <Link
                        key={i}
                        href={`/guides/abilities/${ability.id}?from=item&itemId=${item.id}`}
                        className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-3 py-2 rounded transition-colors group"
                      >
                        <GuideIcon
                          category="abilities"
                          name={ability.name}
                          size={24}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm">{ability.name}</span>
                      </Link>
                    );
                  }
                  
                  // Fallback: show raw ID
                  return (
                    <div key={i} className="flex items-center gap-2 bg-purple-500/20 text-purple-200 px-3 py-2 rounded">
                      <span className="text-xs font-mono">{rawAbilityId}</span>
                      <span className="text-xs text-gray-400">(Unknown ability)</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <Section variant="medieval" className="md:col-span-2">
            <h2 className="font-medieval-brand text-2xl mb-3">Recipe</h2>
            {item.recipe && item.recipe.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-4 mb-3 items-center">
                  {item.recipe.map((ingredientSlug, i) => {
                    const ingredientItem = getItemById(ingredientSlug);
                    if (ingredientItem) {
                      return (
                        <Link
                          key={i}
                          href={`/guides/items/${ingredientItem.id}`}
                          className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity group"
                        >
                          <div className="relative">
                            <GuideIcon
                              category={ingredientItem.category === 'buildings' ? 'buildings' : 'items'}
                              name={ingredientItem.name}
                              size={48}
                              className="group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <span className="text-xs text-amber-300 text-center max-w-[60px] break-words">
                            {ingredientItem.name}
                          </span>
                        </Link>
                      );
                    }
                    // Fallback if item not found
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">?</span>
                        </div>
                        <span className="text-xs text-gray-400 text-center max-w-[60px] break-words">
                          {ingredientSlug.replace(/-/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {item.mixingPotManaRequirement && (
                  <div className="mt-2 text-sm text-purple-300">
                    Requires {item.mixingPotManaRequirement} mana to craft
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No recipe required.</p>
            )}
          </Section>
        </div>
      </div>
    </ErrorBoundary>
  );
}
