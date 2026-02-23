# Integration Icon Download Script
# This script helps download integration icons from various sources

param(
    [switch]$DownloadAll,
    [string]$Integration
)

$iconDir = "docs\assets\integration-icons"
$jsonFile = "integrations.json"

# Icon sources mapping
$iconSources = @{
    'kubernetes' = 'https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg'
    'postgresql' = 'https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg'
    'mysql' = 'https://raw.githubusercontent.com/github/explore/master/topics/mysql/mysql.png'
    'mongodb' = 'https://raw.githubusercontent.com/github/explore/master/topics/mongodb/mongodb.png'
    'redis' = 'https://raw.githubusercontent.com/github/explore/master/topics/redis/redis.png'
    'kafka' = 'https://raw.githubusercontent.com/github/explore/master/topics/kafka/kafka.png'
    'nginx' = 'https://raw.githubusercontent.com/github/explore/master/topics/nginx/nginx.png'
    'jenkins' = 'https://raw.githubusercontent.com/github/explore/master/topics/jenkins/jenkins.png'
    'terraform' = 'https://raw.githubusercontent.com/github/explore/master/topics/terraform/terraform.png'
    'ansible' = 'https://raw.githubusercontent.com/github/explore/master/topics/ansible/ansible.png'
}

function Download-Icon {
    param(
        [string]$IntegrationId,
        [string]$Url
    )
    
    $extension = if ($Url -like "*.svg") { "svg" } else { "png" }
    $outputPath = Join-Path $iconDir "$IntegrationId.$extension"
    
    try {
        Write-Host "Downloading icon for $IntegrationId..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $Url -OutFile $outputPath -ErrorAction Stop
        Write-Host "✓ Downloaded: $outputPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Failed to download $IntegrationId : $_" -ForegroundColor Red
        return $false
    }
}

function Get-SimpleIconsUrl {
    param([string]$Name)
    
    $slug = $Name.ToLower() -replace ' ', '-' -replace '[^a-z0-9-]', ''
    return "https://cdn.simpleicons.org/$slug"
}

# Main execution
Write-Host "OpenObserve Integration Icon Downloader" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $iconDir)) {
    Write-Host "Creating icon directory: $iconDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

# Load integrations.json
if (-not (Test-Path $jsonFile)) {
    Write-Host "Error: $jsonFile not found!" -ForegroundColor Red
    exit 1
}

$integrations = Get-Content $jsonFile | ConvertFrom-Json

Write-Host "Found $($integrations.Count) integrations in $jsonFile" -ForegroundColor Cyan
Write-Host ""

if ($DownloadAll) {
    Write-Host "Attempting to download all available icons..." -ForegroundColor Yellow
    Write-Host ""
    
    $downloaded = 0
    $failed = 0
    
    foreach ($integration in $integrations) {
        $id = $integration.id
        
        if ($iconSources.ContainsKey($id)) {
            if (Download-Icon -IntegrationId $id -Url $iconSources[$id]) {
                $downloaded++
            } else {
                $failed++
            }
        } else {
            # Try Simple Icons
            $simpleIconUrl = Get-SimpleIconsUrl -Name $integration.name
            Write-Host "Trying Simple Icons for $id..." -ForegroundColor Gray
            
            try {
                $response = Invoke-WebRequest -Uri $simpleIconUrl -Method Head -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    if (Download-Icon -IntegrationId $id -Url $simpleIconUrl) {
                        $downloaded++
                    } else {
                        $failed++
                    }
                } else {
                    Write-Host "  No icon found on Simple Icons" -ForegroundColor Gray
                }
            }
            catch {
                Write-Host "  No icon found on Simple Icons" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Yellow
    Write-Host "  Downloaded: $downloaded" -ForegroundColor Green
    Write-Host "  Failed/Not Found: $failed" -ForegroundColor Yellow
    Write-Host "  Total Integrations: $($integrations.Count)" -ForegroundColor Cyan
}
elseif ($Integration) {
    $integration = $integrations | Where-Object { $_.id -eq $Integration }
    
    if (-not $integration) {
        Write-Host "Error: Integration '$Integration' not found in $jsonFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Downloading icon for: $($integration.name)" -ForegroundColor Cyan
    
    if ($iconSources.ContainsKey($Integration)) {
        Download-Icon -IntegrationId $Integration -Url $iconSources[$Integration]
    } else {
        $simpleIconUrl = Get-SimpleIconsUrl -Name $integration.name
        Write-Host "Trying Simple Icons..." -ForegroundColor Gray
        Download-Icon -IntegrationId $Integration -Url $simpleIconUrl
    }
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\download-icons.ps1 -DownloadAll          # Download all available icons"
    Write-Host "  .\download-icons.ps1 -Integration postgres # Download specific integration icon"
    Write-Host ""
    Write-Host "Available integrations:" -ForegroundColor Cyan
    $integrations | ForEach-Object { Write-Host "  - $($_.id) ($($_.name))" }
    Write-Host ""
    Write-Host "Manual Download Resources:" -ForegroundColor Yellow
    Write-Host "  - Simple Icons: https://simpleicons.org/"
    Write-Host "  - DevIcon: https://devicon.dev/"
    Write-Host "  - SVG Repo: https://www.svgrepo.com/"
    Write-Host "  - Official vendor websites"
}

Write-Host ""
Write-Host "Note: Some icons may require manual download from official sources." -ForegroundColor Gray
Write-Host "See docs/assets/integration-icons/DOWNLOAD_GUIDE.md for details." -ForegroundColor Gray
