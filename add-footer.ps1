# Batch script to add Footer import and component to remaining pages

$filesToUpdate = @(
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\account\profile\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\account\addresses\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\orders\[id]\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\payment\paypal\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\payment\phonepay\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\payment\razorpay\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\dashboard\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\coins\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\coins\add\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\coins\[id]\edit\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\orders\page.tsx",
    "c:\Users\Naiem Shaikh\Downloads\sk-coin-seller\app\admin\orders\[id]\page.tsx"
)

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        # Check if Footer is already imported
        if ($content -notmatch 'import.*Footer') {
            # Add import after last import statement
            $content = $content -replace '(import.*\n)(\n(?!import))', "`$1import { Footer } from `"@/components/footer`"`n`$2"
        }
        
        # Check if Footer component is already added before </main>
        if ($content -notmatch '<Footer') {
            # Add Footer before closing </main>
            $content = $content -replace '(\s*)</main>', "`n      <Footer />`n    </main>"
        }
        
        Set-Content $file $content -NoNewline
        Write-Host "Updated: $file"
    }
    else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
