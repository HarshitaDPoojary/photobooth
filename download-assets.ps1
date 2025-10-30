<#
PowerShell helper: download assets needed for the Picapica clone.

This script will:
- create public/assets and public/assets/fonts
- download the photostrip image to public/assets/picapica-photostrip.png
- fetch the Google Fonts CSS for Montserrat and download the woff2 files
  and save them as Montserrat-Regular.woff2 and Montserrat-Bold.woff2 in public/assets/fonts

Run from the project root (PowerShell):
  .\download-assets.ps1

#>

Write-Host "Creating asset directories..."
New-Item -ItemType Directory -Force -Path .\public\assets\fonts | Out-Null

$photoUrl = 'https://picapicabooth.com/picapica-photostrip.png'
$photoOut = 'public\\assets\\picapica-photostrip.png'
Write-Host "Downloading photostrip to $photoOut ..."
Invoke-WebRequest $photoUrl -OutFile $photoOut -UseBasicParsing

Write-Host "Fetching Montserrat font CSS and downloading woff2 files..."
$css = (Invoke-WebRequest "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" -UseBasicParsing).Content
## Match woff2 or ttf URLs (Google Fonts sometimes serves TTF)
$matches = [regex]::Matches($css, 'https://[^)]+\.(woff2|ttf)')

if ($matches.Count -eq 0) {
    Write-Host "No woff2 URLs found in Google Fonts CSS. Exiting."; exit 1
}

# Map first match -> regular (400), second match -> bold (700)
$outDir = 'public\\assets\\fonts'
$i = 0
foreach ($m in $matches) {
    $i++
    $url = $m.Value
  # choose extension based on the URL
  $ext = [System.IO.Path]::GetExtension($url)
  if ($i -eq 1) { $file = "Montserrat-Regular$ext" }
  elseif ($i -eq 2) { $file = "Montserrat-Bold$ext" }
  else { $file = "Montserrat-Extra-$i$ext" }
    $out = Join-Path $outDir $file
    Write-Host "Downloading $url -> $out"
    Invoke-WebRequest $url -OutFile $out -UseBasicParsing
}

Write-Host "Done. Assets saved under public/assets and public/assets/fonts"