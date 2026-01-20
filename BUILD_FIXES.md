# Build Fixes Applied

**Date:** 2026-01-20

## ✅ Fixed Issues

### 1. Syntax Error in Farcaster Route ✅

- **File:** `src/app/.well-known/farcaster.json/route.ts`
- **Issue:** Invalid comment syntax `#app/.well-known/farcaster.json/route.ts` at top of file
- **Fix:** Removed the invalid comment line
- **Status:** ✅ Fixed

### 2. OnchainKit Frame Import ✅

- **File:** `src/app/api/frame/route.ts`
- **Issue:** `@coinbase/onchainkit/frame` export doesn't exist
- **Fix:** Created custom `getFrameHtmlResponse` utility in `src/lib/utils/frame.ts`
- **Status:** ✅ Fixed

## ⚠️ Known Issues (Dependency Compatibility)

### Wagmi/Viem Version Mismatch

- **Error:** `sendTransactionSync` and `waitForCallsStatus` not exported from `viem/actions`
- **Error:** `sendTransactionSync` and `waitForCallsStatus` not exported from `viem/actions`
- **Cause:** Version mismatch between `wagmi@^2.19.5` and `viem@2.21.54`
- **Impact:** Build fails with webpack errors
- **Affected Packages:**
  - `@wagmi/core` trying to import from `viem/actions`
  - `@wagmi/connectors/porto` trying to import chains from `viem/chains`

### Recommended Solutions


## 📝 Files Modified

1. ✅ `src/app/.well-known/farcaster.json/route.ts` - Removed invalid comment
2. ✅ `src/app/api/frame/route.ts` - Updated import to use custom utility
3. ✅ `src/lib/utils/frame.ts` - Created Frame HTML generator utility
4. ⚠️ `next.config.ts` - Added webpack config (may need adjustment)

## 🚀 Next Steps

1. **Resolve dependency conflicts:**

   - Check OnchainKit 0.37.5 documentation for required wagmi/viem versions
   - Update dependencies to compatible versions
   - Or use `--legacy-peer-deps` flag if needed

2. **Test build:**

   ```bash
   npm run build
   ```

3. **If build still fails:**

   - Consider using `npm install --legacy-peer-deps`
   - Or update OnchainKit to a newer version that supports current wagmi/viem

## 📋 Current Status

- ✅ Syntax errors fixed
- ✅ Frame utility created
- ⚠️ Dependency compatibility issues remain (requires dependency updates)
