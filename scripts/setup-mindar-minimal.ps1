# Setup MindAR locally for better stability (Three.js only)
Write-Host "🚀 Setting up minimal MindAR (Three.js only)..." -ForegroundColor Green

# Create assets directory
$mindarDir = "packages/frontend/public/assets/mindar"
New-Item -ItemType Directory -Force -Path $mindarDir | Out-Null
New-Item -ItemType Directory -Force -Path "$mindarDir/examples" | Out-Null
New-Item -ItemType Directory -Force -Path "$mindarDir/examples/softmind" | Out-Null

# MindAR version
$version = "1.2.5"
$cdnBaseUrl = "https://cdn.jsdelivr.net/npm/mind-ar@$version/dist"

Write-Host "📦 Using MindAR version: $version" -ForegroundColor Yellow

# Download ONLY the Three.js version (no A-Frame) - using working CDN URLs
Write-Host "🔄 Downloading MindAR Three.js version..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$cdnBaseUrl/mindar-image-three.prod.js" -OutFile "$mindarDir/mindar-image-three.prod.js"
Write-Host "✅ Downloaded mindar-image-three.prod.js" -ForegroundColor Green

# Download core image tracking (needed for Three.js)
Invoke-WebRequest -Uri "$cdnBaseUrl/mindar-image.prod.js" -OutFile "$mindarDir/mindar-image.prod.js"
Write-Host "✅ Downloaded mindar-image.prod.js" -ForegroundColor Green

# Download sample assets for testing
Write-Host "🔄 Downloading sample assets..." -ForegroundColor Cyan

# Sample target image and compiled target
Invoke-WebRequest -Uri "https://github.com/hiukim/mind-ar-js/raw/master/examples/image-tracking/assets/card-example/card.mind" -OutFile "$mindarDir/examples/card.mind"
Write-Host "✅ Downloaded sample target: card.mind" -ForegroundColor Green

Invoke-WebRequest -Uri "https://github.com/hiukim/mind-ar-js/raw/master/examples/image-tracking/assets/card-example/card.png" -OutFile "$mindarDir/examples/card.png"
Write-Host "✅ Downloaded sample image: card.png" -ForegroundColor Green

# Sample 3D model for testing
Invoke-WebRequest -Uri "https://github.com/hiukim/mind-ar-js/raw/master/examples/image-tracking/assets/card-example/softmind/scene.gltf" -OutFile "$mindarDir/examples/softmind/scene.gltf"
Write-Host "✅ Downloaded sample model: scene.gltf" -ForegroundColor Green

Invoke-WebRequest -Uri "https://github.com/hiukim/mind-ar-js/raw/master/examples/image-tracking/assets/card-example/softmind/scene.bin" -OutFile "$mindarDir/examples/softmind/scene.bin"
Write-Host "✅ Downloaded sample model: scene.bin" -ForegroundColor Green

Invoke-WebRequest -Uri "https://github.com/hiukim/mind-ar-js/raw/master/examples/image-tracking/assets/card-example/softmind/texture.jpg" -OutFile "$mindarDir/examples/softmind/texture.jpg"
Write-Host "✅ Downloaded sample texture: texture.jpg" -ForegroundColor Green

$items = @{
    "mindar-image.prod.js" = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js";
    "mindar-image-three.prod.js" = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
    "mindar-image-three-umd.prod.js" = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js"; # Note: UMD name is a fallback
    "controller-mGt1s8dJ.js" = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/controller-mGt1s8dJ.js";
    "ui-fBadYuor.js" = "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/ui-fBadYuor.js";
}

# Download core MindAR files
foreach ($item in $items.GetEnumerator()) {
    $fileName = $item.Key
    $url = $item.Value
    Write-Host "🔄 Downloading $fileName..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $url -OutFile "$mindarDir/$fileName"
    Write-Host "✅ Downloaded $fileName" -ForegroundColor Green
}

Write-Host "🎉 Minimal MindAR setup complete!" -ForegroundColor Green
Write-Host "📁 Files downloaded to: packages/frontend/public/assets/mindar/" -ForegroundColor Cyan
Write-Host "🎯 Three.js only - no A-Frame dependencies" -ForegroundColor Cyan
Write-Host "🧪 Ready for testing with sample assets" -ForegroundColor Cyan
