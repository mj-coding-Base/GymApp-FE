#!/bin/bash
# Verify PM2 deployment setup is complete
# Run this before deploying: ./VERIFY_PM2_SETUP.sh

set -e

echo "🔍 Verifying PM2 deployment setup..."
echo ""

ERRORS=0
WARNINGS=0

# Check 1: ecosystem.config.cjs exists
echo "1️⃣  Checking ecosystem.config.cjs..."
if [ -f "ecosystem.config.cjs" ]; then
    echo "   ✅ ecosystem.config.cjs exists"
    
    # Check if standalone mode is disabled in next.config.ts
    if grep -q "// output: 'standalone'" next.config.ts || ! grep -q "output: 'standalone'" next.config.ts; then
        echo "   ✅ Standalone mode is disabled (correct for PM2)"
    else
        echo "   ❌ ERROR: Standalone mode is enabled in next.config.ts"
        echo "      Comment out: output: 'standalone'"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   ❌ ERROR: ecosystem.config.cjs not found!"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: start-prod.js exists
echo ""
echo "2️⃣  Checking start-prod.js..."
if [ -f "scripts/start-prod.js" ]; then
    echo "   ✅ scripts/start-prod.js exists"
else
    echo "   ❌ ERROR: scripts/start-prod.js not found!"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Native binary fix scripts
echo ""
echo "3️⃣  Checking native binary fix scripts..."
if [ -f "scripts/fix-lightningcss.js" ]; then
    echo "   ✅ scripts/fix-lightningcss.js exists"
else
    echo "   ⚠️  WARNING: scripts/fix-lightningcss.js not found"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "scripts/fix-native-binaries.js" ]; then
    echo "   ✅ scripts/fix-native-binaries.js exists"
else
    echo "   ⚠️  WARNING: scripts/fix-native-binaries.js not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 4: package.json scripts
echo ""
echo "4️⃣  Checking package.json scripts..."
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json; then
        echo "   ✅ build script exists"
    else
        echo "   ❌ ERROR: build script not found in package.json"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q '"start"' package.json; then
        echo "   ✅ start script exists"
    else
        echo "   ❌ ERROR: start script not found in package.json"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   ❌ ERROR: package.json not found!"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: .env file (optional but recommended)
echo ""
echo "5️⃣  Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "NODE_ENV" .env; then
        echo "   ✅ NODE_ENV is set"
    else
        echo "   ⚠️  WARNING: NODE_ENV not found in .env"
        WARNINGS=$((WARNINGS + 1))
    fi
    if grep -q "PORT" .env; then
        echo "   ✅ PORT is set"
    else
        echo "   ⚠️  WARNING: PORT not found in .env"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  WARNING: .env file not found (will use defaults)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Node modules
echo ""
echo "6️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
    
    # Check for critical packages
    if [ -d "node_modules/next" ]; then
        echo "   ✅ Next.js installed"
    else
        echo "   ❌ ERROR: Next.js not installed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -d "node_modules/tailwindcss" ]; then
        echo "   ✅ Tailwind CSS installed"
    else
        echo "   ⚠️  WARNING: Tailwind CSS not installed"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  WARNING: node_modules not found (run: npm install)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 7: Build output
echo ""
echo "7️⃣  Checking build output..."
if [ -d ".next" ]; then
    echo "   ✅ .next directory exists (app has been built)"
    
    if [ -d ".next/static" ]; then
        echo "   ✅ Static files directory exists"
        
        if [ -d ".next/static/css" ]; then
            CSS_COUNT=$(ls -1 .next/static/css/*.css 2>/dev/null | wc -l)
            if [ "$CSS_COUNT" -gt 0 ]; then
                echo "   ✅ CSS files found ($CSS_COUNT files)"
            else
                echo "   ⚠️  WARNING: No CSS files found in .next/static/css/"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            echo "   ⚠️  WARNING: .next/static/css directory not found"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "   ⚠️  WARNING: .next/static directory not found"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  WARNING: .next directory not found (app not built yet)"
    echo "      Run: npm run build"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready for PM2 deployment."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found, but no errors."
    echo "   You can proceed with deployment, but review warnings above."
    exit 0
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found."
    echo "   Please fix the errors before deploying."
    exit 1
fi

