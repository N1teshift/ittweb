# Website Enhancement Guide - New Ability Data

## 🎯 What New Information You Gained

### 1. **Area of Effect (AOE)**
- **Field**: `areaOfEffect?: number`
- **What it is**: The radius in which the ability affects units
- **Example**: Flame Spray has AOE of 600, meaning it hits all enemies within 600 range
- **Use case**: Show players the effective range of AOE abilities

### 2. **Maximum Targets**
- **Field**: `maxTargets?: number`
- **What it is**: Maximum number of units the ability can hit
- **Example**: Flame Spray can hit up to 4 targets
- **Use case**: Help players understand multi-target capabilities

### 3. **Hotkey**
- **Field**: `hotkey?: string`
- **What it is**: Keyboard shortcut to cast the ability
- **Example**: "W" for Flame Spray
- **Use case**: Show players the keyboard shortcut for quick reference

### 4. **Targets Allowed**
- **Field**: `targetsAllowed?: string`
- **What it is**: What can be targeted (units, items, terrain, etc.)
- **Example**: "unit", "item", "terrain", "self"
- **Use case**: Clarify targeting restrictions

### 5. **Level-Specific Data**
- **Field**: `levels?: { [level: number]: { damage?, manaCost?, cooldown?, duration?, range?, areaOfEffect? } }`
- **What it is**: How the ability scales with levels
- **Example**: Level 1 does 20 damage, Level 2 does 40 damage
- **Use case**: Show ability progression and scaling

### 6. **Available to Classes**
- **Field**: `availableToClasses?: string[]`
- **What it is**: Which classes can learn this ability
- **Example**: ["mage", "elementalist", "hypnotist", "dreamwalker"]
- **Use case**: Filter abilities by class, show class requirements

### 7. **Spellbook**
- **Field**: `spellbook?: string`
- **What it is**: Which spellbook contains this ability ("hero" or "normal")
- **Example**: "normal" for regular abilities, "hero" for hero abilities
- **Use case**: Organize abilities by spellbook type

### 8. **Visual Effects**
- **Field**: `visualEffects?: { missileArt?, attachmentPoints?, artEffect?, artTarget?, artCaster? }`
- **What it is**: Visual effect information
- **Example**: Fireball missile, attachment points for effects
- **Use case**: Show visual effect details (advanced/technical info)

### 9. **Cast Time**
- **Field**: `castTime?: string`
- **What it is**: Time required to cast the ability
- **Use case**: Show casting requirements

---

## 🚀 How to Enhance Your Website

### Enhancement 1: Enhanced Ability Cards

**Current**: Shows basic stats (mana, cooldown, range, duration, damage)

**Enhanced**: Add AOE, max targets, and hotkey badges

```tsx
// In src/pages/guides/abilities.tsx and [slug].tsx
const primaryBadges = [
  ability.manaCost !== undefined
    ? { label: `Mana: ${ability.manaCost}`, variant: 'blue' as const }
    : null,
  ability.cooldown !== undefined
    ? { label: `Cooldown: ${ability.cooldown}s`, variant: 'purple' as const }
    : null,
  ability.range !== undefined
    ? { label: `Range: ${ability.range}`, variant: 'green' as const }
    : null,
  // NEW: Add AOE
  ability.areaOfEffect !== undefined
    ? { label: `AOE: ${ability.areaOfEffect}`, variant: 'cyan' as const }
    : null,
  // NEW: Add max targets
  ability.maxTargets !== undefined
    ? { label: `Targets: ${ability.maxTargets}`, variant: 'indigo' as const }
    : null,
  // NEW: Add hotkey
  ability.hotkey
    ? { label: `[${ability.hotkey}]`, variant: 'yellow' as const }
    : null,
  ability.duration !== undefined
    ? { label: `Duration: ${ability.duration}s`, variant: 'amber' as const }
    : null,
  ability.damage
    ? { label: `Damage: ${ability.damage}`, variant: 'red' as const }
    : null,
].filter(Boolean);
```

### Enhancement 2: Ability Detail Page - Level Scaling Display

**Location**: `src/pages/guides/abilities/[id].tsx`

**Add a new section** showing level progression:

```tsx
{ability.levels && Object.keys(ability.levels).length > 0 && (
  <section className="mt-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
    <h3 className="font-medieval text-xl mb-4 text-amber-400">Level Scaling</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(ability.levels).map(([level, data]) => (
        <div key={level} className="bg-black/20 rounded p-4">
          <h4 className="font-medieval text-amber-300 mb-2">Level {level}</h4>
          <div className="space-y-1 text-sm">
            {data.damage !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Damage:</span>
                <span className="text-red-400">{data.damage}</span>
              </div>
            )}
            {data.manaCost !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mana:</span>
                <span className="text-blue-400">{data.manaCost}</span>
              </div>
            )}
            {data.cooldown !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Cooldown:</span>
                <span className="text-purple-400">{data.cooldown}s</span>
              </div>
            )}
            {data.range !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Range:</span>
                <span className="text-green-400">{data.range}</span>
              </div>
            )}
            {data.areaOfEffect !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">AOE:</span>
                <span className="text-cyan-400">{data.areaOfEffect}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
)}
```

### Enhancement 3: Class Filtering & Availability

**Location**: `src/pages/guides/abilities.tsx`

**Add a class filter** using `availableToClasses`:

```tsx
const [selectedClass, setSelectedClass] = useState<string>('all');

// Filter abilities by class
const filteredAbilities = useMemo(() => {
  let filtered = abilities;
  
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(a => a.category === selectedCategory);
  }
  
  if (selectedClass !== 'all') {
    filtered = filtered.filter(a => 
      a.availableToClasses?.includes(selectedClass) || 
      a.classRequirement === selectedClass
    );
  }
  
  if (searchQuery) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filtered;
}, [abilities, selectedCategory, selectedClass, searchQuery]);

// Add class filter UI
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Filter by Class
  </label>
  <select
    value={selectedClass}
    onChange={(e) => setSelectedClass(e.target.value)}
    className="bg-black/30 border border-amber-500/30 rounded px-4 py-2 text-white"
  >
    <option value="all">All Classes</option>
    <option value="hunter">Hunter</option>
    <option value="mage">Mage</option>
    <option value="priest">Priest</option>
    <option value="beastmaster">Beastmaster</option>
    <option value="thief">Thief</option>
    <option value="scout">Scout</option>
    <option value="gatherer">Gatherer</option>
  </select>
</div>
```

### Enhancement 4: Show "Available to Classes" on Ability Cards

**Add to secondary badges**:

```tsx
const secondaryBadges = [
  ability.classRequirement
    ? { label: ability.classRequirement, variant: 'amber' as const }
    : null,
  // NEW: Show all classes that can use this ability
  ability.availableToClasses && ability.availableToClasses.length > 0
    ? { 
        label: `${ability.availableToClasses.length} class${ability.availableToClasses.length > 1 ? 'es' : ''}`, 
        variant: 'blue' as const,
        title: ability.availableToClasses.join(', ') // Tooltip
      }
    : null,
  ability.category
    ? { label: ABILITY_CATEGORIES[ability.category] || ability.category, variant: 'gray' as const }
    : null,
].filter(Boolean);
```

### Enhancement 5: Enhanced Ability Detail Page - Full Stats

**Location**: `src/pages/guides/abilities/[id].tsx`

**Add comprehensive stats section**:

```tsx
<section className="mt-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
  <h3 className="font-medieval text-xl mb-4 text-amber-400">Ability Stats</h3>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {ability.manaCost !== undefined && (
      <StatItem label="Mana Cost" value={ability.manaCost} color="blue" />
    )}
    {ability.cooldown !== undefined && (
      <StatItem label="Cooldown" value={`${ability.cooldown}s`} color="purple" />
    )}
    {ability.range !== undefined && (
      <StatItem label="Range" value={ability.range} color="green" />
    )}
    {ability.areaOfEffect !== undefined && (
      <StatItem label="Area of Effect" value={ability.areaOfEffect} color="cyan" />
    )}
    {ability.maxTargets !== undefined && (
      <StatItem label="Max Targets" value={ability.maxTargets} color="indigo" />
    )}
    {ability.duration !== undefined && (
      <StatItem label="Duration" value={`${ability.duration}s`} color="amber" />
    )}
    {ability.hotkey && (
      <StatItem label="Hotkey" value={`[${ability.hotkey}]`} color="yellow" />
    )}
    {ability.targetsAllowed && (
      <StatItem label="Targets" value={ability.targetsAllowed} color="gray" />
    )}
    {ability.castTime && (
      <StatItem label="Cast Time" value={ability.castTime} color="orange" />
    )}
  </div>
</section>

// Helper component
function StatItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-400',
    amber: 'text-amber-400',
    yellow: 'text-yellow-400',
    gray: 'text-gray-400',
    orange: 'text-orange-400',
  };
  
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`font-medieval ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
    </div>
  );
}
```

### Enhancement 6: Class Availability Section

**Add to ability detail page**:

```tsx
{ability.availableToClasses && ability.availableToClasses.length > 0 && (
  <section className="mt-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
    <h3 className="font-medieval text-xl mb-4 text-amber-400">Available to Classes</h3>
    <div className="flex flex-wrap gap-2">
      {ability.availableToClasses.map((className) => (
        <Link
          key={className}
          href={`/guides/classes/${className}`}
          className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded px-3 py-1 text-sm transition-colors"
        >
          {className.charAt(0).toUpperCase() + className.slice(1)}
        </Link>
      ))}
    </div>
  </section>
)}
```

### Enhancement 7: Spellbook Badge

**Add spellbook indicator**:

```tsx
{ability.spellbook && (
  <div className="inline-block bg-purple-500/20 border border-purple-500/50 rounded px-2 py-1 text-xs text-purple-300">
    {ability.spellbook === 'hero' ? 'Hero Ability' : 'Normal Ability'}
  </div>
)}
```

### Enhancement 8: Search Enhancement

**Enhance search to include hotkeys**:

```tsx
const filteredAbilities = useMemo(() => {
  if (!searchQuery) return abilities;
  
  const query = searchQuery.toLowerCase();
  return abilities.filter(a =>
    a.name.toLowerCase().includes(query) ||
    a.description.toLowerCase().includes(query) ||
    a.hotkey?.toLowerCase().includes(query) || // NEW: Search by hotkey
    a.availableToClasses?.some(c => c.toLowerCase().includes(query)) // NEW: Search by class
  );
}, [abilities, searchQuery]);
```

---

## 📊 Summary of Enhancements

| Enhancement | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Add AOE/Max Targets/Hotkey badges | High - More info at a glance | Low | ⭐⭐⭐⭐⭐ |
| Level scaling display | High - Shows progression | Medium | ⭐⭐⭐⭐ |
| Class filtering | High - Better navigation | Medium | ⭐⭐⭐⭐ |
| Enhanced detail page stats | Medium - Comprehensive info | Low | ⭐⭐⭐ |
| Class availability links | Medium - Cross-linking | Low | ⭐⭐⭐ |
| Spellbook badge | Low - Nice to have | Low | ⭐⭐ |

---

## 🎨 Visual Examples

### Before (Current):
```
┌─────────────────────────┐
│ [Icon] Flame Spray      │
│ Shoots fire bolt...     │
│ Mana: 10 | Cooldown: 30│
│ Mage                    │
└─────────────────────────┘
```

### After (Enhanced):
```
┌─────────────────────────┐
│ [Icon] Flame Spray [W]  │
│ Shoots fire bolt...     │
│ Mana: 10 | CD: 30s     │
│ AOE: 600 | Targets: 4  │
│ Mage | 4 classes       │
│ ─────────────────────── │
│ Level 1: 20 dmg, 10 mp │
│ Level 2: 40 dmg, 15 mp │
└─────────────────────────┘
```

---

## 🔧 Implementation Checklist

- [ ] Update TypeScript types (already done ✅)
- [ ] Add new badges to ability cards
- [ ] Create level scaling display component
- [ ] Add class filter to abilities page
- [ ] Enhance ability detail page with full stats
- [ ] Add class availability section
- [ ] Add spellbook badge
- [ ] Enhance search functionality
- [ ] Test with real data after running extraction

---

## 💡 Pro Tips

1. **Progressive Enhancement**: Start with the most visible changes (badges) first
2. **Conditional Rendering**: Only show fields that exist (use optional chaining)
3. **Color Coding**: Use consistent colors for stat types (blue=mana, purple=cooldown, etc.)
4. **Mobile Responsive**: Ensure new UI elements work on mobile
5. **Performance**: Use `useMemo` for filtered lists to avoid re-computation

---

## 🚀 Quick Start

1. **Update types** (already done ✅)
2. **Run data extraction** to get the new fields:
   ```bash
   node scripts/data/generate-from-work.mjs
   ```
3. **Start with badges** - easiest and most visible improvement
4. **Add level scaling** - high value for players
5. **Add class filtering** - improves navigation

The new data is ready to use - just update your UI components to display it!

