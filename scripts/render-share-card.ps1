# Render a simple share-card layout using the unmodified, supplied logo.
# The logo stays in the central square so it also fits compact link previews.
Add-Type -AssemblyName System.Drawing
$siteRoot = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $siteRoot 'public\HP_logo_square.png'
$outputPath = Join-Path $siteRoot 'public\og-image.png'
$canvas = [System.Drawing.Bitmap]::new(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$logo = [System.Drawing.Image]::FromFile($logoPath)
try {
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new(220, -65, 760, 760))
    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Share card rendered: $outputPath (1200 x 630)"
} finally {
    $logo.Dispose()
    $graphics.Dispose()
    $canvas.Dispose()
}
