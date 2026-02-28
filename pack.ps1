$dist = 'C:\Users\Maxim\IdeaProjects\ChromeUnidraw\dist'
$dst = 'C:\Users\Maxim\Desktop\bob-hates-your-diagrams-v1.3.0.zip'

if (-not (Test-Path $dist)) {
    Write-Host "ERROR: dist/ not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

if (Test-Path $dst) { Remove-Item $dst }

Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $dst

$size = [math]::Round((Get-Item $dst).Length / 1MB, 2)
Write-Host "OK: $dst ($size MB)"
