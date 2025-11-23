# PowerShell script to upload house images to R2 storage

$API_URL = "https://d7b478e7.merry-rigged-mas.pages.dev/api/upload-photo"
$HOUSE_IMAGES_DIR = ".\House-Images"

# Get all image files
$imageFiles = Get-ChildItem -Path $HOUSE_IMAGES_DIR -Filter "*.png"

Write-Host "Found $($imageFiles.Count) images to upload:" -ForegroundColor Green
foreach ($file in $imageFiles) {
    Write-Host "  - $($file.Name)"
}
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $imageFiles) {
    # Extract house number from filename
    if ($file.Name -match "house-?(\d+)") {
        $houseNumber = [int]$matches[1]
        
        Write-Host "Uploading $($file.Name) for house $houseNumber..." -ForegroundColor Yellow
        
        try {
            # Create multipart form data
            $boundary = [System.Guid]::NewGuid().ToString()
            $LF = "`r`n"
            
            # Read file bytes
            $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
            $fileContent = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
            
            # Build form data
            $bodyLines = @(
                "--$boundary",
                "Content-Disposition: form-data; name=`"houseId`"",
                "",
                $houseNumber,
                "--$boundary",
                "Content-Disposition: form-data; name=`"photo`"; filename=`"$($file.Name)`"",
                "Content-Type: image/png",
                "",
                $fileContent,
                "--$boundary--"
            ) -join $LF
            
            $body = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($bodyLines)
            
            # Make the request
            $response = Invoke-RestMethod -Uri $API_URL -Method POST -Body $body -ContentType "multipart/form-data; boundary=$boundary"
            
            if ($response.success) {
                Write-Host "  ✅ Successfully uploaded: $($response.imageUrl)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Failed: $($response.error)" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
        
        # Small delay between uploads
        Start-Sleep -Milliseconds 1000
    }
    else {
        Write-Host "  ⚠️ Skipping $($file.Name) - couldn't extract house number" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "📊 Upload Summary:" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red