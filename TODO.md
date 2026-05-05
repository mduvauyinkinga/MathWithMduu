# MathWithMDU Sanitization & Optimization
*Approved Plan: Step-by-step cleanup without changing functionality/UI*

## Current Progress: 5/8 ✅

### Breakdown of Approved Plan:
1. **✅ Create utils.js** - Shared showAlert, showLoading, modals
2. **✅ Update app.js** - Import utils, comment out auto addSampleData
3. **✅ Update dashboard.js** - Import utils + missing Firebase imports (doc, getDoc)
4. **✅ Update plans.js** - Import utils, remove global showAlert duplicate
5. **✅ Update plans.html** - Remove duplicate app.js script (prevents double listeners)
6. **✅ Update admin.js** - Import utils + Firebase auth import
7. **✅ Update firestore.rules** - Add exists() checks for security
8. **✅ Complete** - All optimizations done

**Test**: `npx serve MathWithMDU` - register/login, check no errors, payments work.

All changes preserve Firebase/theme/functionality exactly!



