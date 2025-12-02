# Pipeline Troubleshooting Guide

Common issues, errors, and debugging procedures for the data generation pipeline.

## Quick Debug Checklist

1. ✅ Check `external/Work/` directory has required files
2. ✅ Verify input files are not corrupted
3. ✅ Check intermediate JSON files in `tmp/work-data/`
4. ✅ Review console output for specific error messages
5. ✅ Validate generated TypeScript files compile
6. ✅ Check file permissions and disk space

---

## Common Errors & Solutions

### Error: "Work directory not found"

**Symptoms:**
```
❌ Work directory not found: external/Work/
```

**Solution:**
1. Verify `external/Work/` directory exists in project root
2. Ensure you have required files:
   - `war3map.w3t` (items)
   - `war3map.w3a` (abilities)
   - `war3map.w3u` (units)
   - `war3map.w3b` (buildings)
   - `war3map.j` (JASS code for recipes)

**How to prepare input files:**
- See [Input File Preparation](./../README.md#required-inputs) in main README
- Or use `docs/systems/scripts/extract-w3x.md` for detailed extraction instructions

---

### Error: "Missing required files in Work directory"

**Symptoms:**
```
❌ Missing required files in Work directory: war3map.w3t, war3map.w3a
```

**Solution:**
1. Extract missing files from the `.w3x` map file using MPQ Editor
2. Place extracted files directly in `external/Work/` directory
3. Verify file names match exactly (case-sensitive on Linux/Mac)

---

### Error: "No items/abilities/units data found"

**Symptoms:**
```
❌ No items data found
❌ No abilities data found
```

**Solutions:**
1. **Check extraction stage completed:**
   ```bash
   ls -la tmp/work-data/raw/
   ```
   Should contain: `items.json`, `abilities.json`, `units.json`, `buildings.json`

2. **Re-run extraction:**
   ```bash
   node scripts/data/extract/extract-from-w3x.mjs
   ```

3. **Check input files are valid:**
   - Files should not be empty
   - Files should be readable (check permissions)
   - Files should be in correct format (Warcraft 3 object data)

---

### Error: TypeScript compilation failures

**Symptoms:**
```
Type errors in generated files
Build fails after running pipeline
```

**Solutions:**
1. **Check for syntax errors in generated files:**
   ```bash
   npm run type-check
   ```

2. **Common issues:**
   - Missing required fields (id, name, category)
   - Invalid TypeScript syntax in generated data
   - Type mismatches (string vs number)

3. **Debug specific file:**
   ```bash
   npx tsc --noEmit src/features/modules/guides/data/[problem-file].ts
   ```

4. **Check converter logic:**
   - Review `scripts/data/converters/` for field mapping issues
   - Verify all required fields are being set

---

### Error: "No ability data found. Please run extraction first"

**Symptoms:**
```
❌ No ability data found. Please run extraction first
```

**Solution:**
1. Run full extraction pipeline:
   ```bash
   node scripts/data/extract/extract-from-w3x.mjs
   ```

2. Verify ability data exists:
   ```bash
   cat tmp/work-data/raw/abilities.json | head -20
   ```

3. If file exists but script can't read it:
   - Check file permissions
   - Verify JSON is valid: `cat tmp/work-data/raw/abilities.json | jq .`

---

### Warning: "Error parsing [object type]"

**Symptoms:**
```
⚠️  Error parsing abilities: [error message]
```

**Solutions:**
1. **Check specific object causing issue:**
   - Review console output for object ID
   - Check if object exists in input files

2. **Common causes:**
   - Corrupted object data in war3map files
   - Missing required fields
   - Unexpected data format

3. **Workaround:**
   - Pipeline continues but may skip problematic objects
   - Check final output to see what was extracted
   - Report issue if data is missing

---

### Issue: Missing or incorrect data in output

**Symptoms:**
- Items/abilities missing from generated files
- Incorrect values in generated data
- Missing fields

**Debugging Steps:**
1. **Check intermediate JSON files:**
   ```bash
   # Check raw extraction
   cat tmp/work-data/raw/items.json | jq '.items | length'
   
   # Check metadata
   cat tmp/work-data/metadata/recipes.json | jq 'keys'
   ```

2. **Check converter logic:**
   - Review filtering logic in converters
   - Check category mapping rules
   - Verify field extraction logic

3. **Check for filtering:**
   - Some items/abilities may be filtered out
   - Check category mapper for exclusion rules
   - Review converter for null/undefined checks

4. **Compare input vs output:**
   - Find item/ability in raw JSON
   - Check if it appears in generated TypeScript
   - Trace through conversion logic

---

### Issue: Icon paths are incorrect

**Symptoms:**
- Icons not displaying in application
- Icon paths pointing to wrong locations

**Solutions:**
1. **Run icon path fixer:**
   ```bash
   node scripts/data/generate/fix-icon-paths.mjs
   ```

2. **Check icon mapping:**
   ```bash
   # View icon map
   cat src/features/modules/guides/data/iconMap.ts | grep "your-icon-name"
   ```

3. **Verify icon files exist:**
   ```bash
   ls -la public/icons/itt/items/
   ```

4. **Check icon path conversion:**
   - Icons should be relative paths (e.g., `BTNIcon.png`)
   - Should not include `/icons/itt/` prefix in data files
   - Application adds prefix when resolving

---

### Issue: Field references not resolved

**Symptoms:**
- Tooltips show `<AMd5,Cool1>` instead of actual values
- Placeholders remain in generated data

**Solutions:**
1. **Check ability data is loaded:**
   - Verify `tmp/work-data/raw/abilities.json` exists
   - Check ability ID mapper exists: `src/features/modules/guides/data/items/abilityIdMapper.ts`

2. **Re-run field reference resolver:**
   ```bash
   node scripts/data/generate/resolve-field-references.mjs
   ```

3. **Check for missing ability mappings:**
   - Some field references may point to abilities not in extracted data
   - These will remain as placeholders (expected behavior)

4. **Verify field reference pattern:**
   - Pattern: `<ABILITY_ID,FIELD_ID>`
   - Example: `<AMd5,Cool1>` → cooldown for ability AMd5

---

## Performance Issues

### Pipeline runs very slowly

**Symptoms:**
- Pipeline takes more than 5-10 minutes to complete

**Solutions:**
1. **Run only needed stages:**
   - If you only changed items, run from item extraction stage onwards
   - Skip earlier stages if data hasn't changed

2. **Check for performance bottlenecks:**
   - Large input files
   - Complex regex patterns
   - Repeated file reads

3. **Optimize if needed:**
   - See `scripts/data/REFACTORING_PLAN.md` for optimization notes
   - Consider batching file operations
   - Cache parsed JSON files

---

### Out of memory errors

**Symptoms:**
```
FATAL ERROR: Reached heap limit
```

**Solutions:**
1. **Increase Node.js memory:**
   ```bash
   node --max-old-space-size=4096 scripts/data/main.mjs
   ```

2. **Process files in batches:**
   - Split large JSON files if possible
   - Process entities in chunks

3. **Check for memory leaks:**
   - Review scripts for large arrays/objects held in memory
   - Ensure files are closed after reading

---

## Data Validation

### How to Verify Pipeline Output

1. **Check file counts:**
   ```bash
   # Count generated items
   find src/features/modules/guides/data/items -name "*.ts" -type f | wc -l
   
   # Count generated abilities
   find src/features/modules/guides/data/abilities -name "*.ts" -type f | wc -l
   ```

2. **Verify TypeScript compilation:**
   ```bash
   npm run type-check
   ```

3. **Spot-check specific files:**
   ```bash
   # Check a specific item
   cat src/features/modules/guides/data/items/weapons.ts | grep -A 10 "sword"
   
   # Check recipe data
   cat tmp/work-data/metadata/recipes.json | jq '.["sword-of-power"]'
   ```

4. **Verify icon mapping:**
   ```bash
   # Check icon map was generated
   test -f src/features/modules/guides/data/iconMap.ts && echo "Icon map exists"
   
   # Count mapped icons
   cat src/features/modules/guides/data/iconMap.ts | grep -c ":" | head -1
   ```

---

## Getting Help

### Debugging Workflow

1. **Identify the failing stage:**
   - Check console output for which script failed
   - Note the error message and stack trace

2. **Check intermediate files:**
   - Review JSON files in `tmp/work-data/`
   - Verify data at each stage

3. **Isolate the problem:**
   - Run individual scripts to isolate the issue
   - Test with minimal data if possible

4. **Review relevant documentation:**
   - Check script-specific docs in `docs/systems/scripts/`
   - Review converter logic in `scripts/data/converters/`

### Useful Debugging Commands

```bash
# Check what was extracted
ls -lh tmp/work-data/raw/

# View sample extracted data
jq '.items[0:3]' tmp/work-data/raw/items.json

# Check metadata
jq 'keys' tmp/work-data/metadata/recipes.json

# Verify generated files
find src/features/modules/guides/data -name "*.ts" -type f

# Check for TypeScript errors
npm run type-check 2>&1 | grep -A 5 "error"

# Test specific script
node scripts/data/extract-from-w3x.mjs 2>&1 | tee debug.log
```

---

## Related Documentation

- [Pipeline Architecture](./architecture.md) - Understanding the pipeline flow
- [Data Schemas](./schemas.md) - Expected data structures
- [Main Pipeline README](../../../scripts/README.md) - Operational guide
- [Field References](./guides/field-references.md) - Understanding field references
- [Refactoring Plan](../../../scripts/data/docs/REFACTORING_PLAN.md) - Known issues and improvements

