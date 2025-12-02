@echo off
cd docs
move getting-started development\
move operations development\
move performance development\
move archive development\
move DOCUMENTATION_STYLE.md shared\
move documentation-lifecycle.md shared\
move ERROR_HANDLING.md shared\
move error-handling shared\
move KNOWN_ISSUES.md shared\
move PERFORMANCE.md shared\
move SECURITY.md shared\
echo Done moving files
