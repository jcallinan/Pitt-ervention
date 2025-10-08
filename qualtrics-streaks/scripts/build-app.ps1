<# ======================================================================
  build-app.ps1 — Expo/EAS build helper for Windows (PowerShell)
  Tailored to this repo:
    - android.package: com.jcallinan.qualtricsstreaks
    - ios.bundleIdentifier: com.jcallinan.qualtricsstreaks

    Your app.json currently has "version": "1.0.0" and no versionCode/buildNumber.  :contentReference[oaicite:1]{index=1}


    Ready-to-run examples (PowerShell)

    Bump versions automatically and build + install an APK

    .\scripts\build-app.ps1 -AutoIncrement -BuildAndroidApk -InstallLastApk


    Build Play Store bundle

    .\scripts\build-app.ps1 -AutoIncrement -BuildAndroidAab


    Build iOS Ad Hoc (manual .ipa for registered devices)

    .\scripts\build-app.ps1 -AutoIncrement -BuildIosAdHoc

    Build & submit to TestFlight

    .\scripts\build-app.ps1 -AutoIncrement -BuildIosTestFlight -SubmitIos


    If Android acts up

    .\scripts\build-app.ps1 -CleanGradle

  ====================================================================== #>

[CmdletBinding()]
param(
  # Mutators
  [switch]$SetIds,
  [string]$AndroidPackage = 'com.jcallinan.qualtricsstreaks',
  [string]$iOSBundleId   = 'com.jcallinan.qualtricsstreaks',

  [switch]$SetVersions,              # set explicit versions
  [int]$AndroidVersionCode = 1,
  [string]$iOSBuildNumber = "1",

  [switch]$AutoIncrement,            # read current and +1 both platforms

  # Build targets
  [switch]$BuildAndroidApk,          # produces .apk for sideload
  [switch]$BuildAndroidAab,          # produces .aab for Play Console
  [switch]$BuildIosAdHoc,            # Ad Hoc .ipa (registered devices)
  [switch]$BuildIosTestFlight,       # App Store/TestFlight build

  # Post actions
  [switch]$InstallLastApk,           # adb install newest .apk in Downloads
  [switch]$SubmitIos,                # eas submit -p ios (after TestFlight build)

  # Maintenance
  [switch]$CleanGradle               # stop daemons & clear caches
)

$ErrorActionPreference = 'Stop'

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err ($m){ Write-Host "[ERR ] $m" -ForegroundColor Red }

function Assert-File($p){ if(-not (Test-Path $p)){ throw "Required file not found: $p" } }

function Get-AppJson {
  $p = Join-Path (Get-Location) 'app.json'
  Assert-File $p
  Get-Content $p -Raw | ConvertFrom-Json
}
function Save-AppJson([object]$obj){
  $p = Join-Path (Get-Location) 'app.json'
  $obj | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $p
  Write-Info "Saved $p"
}
function Ensure-ExpoNodes([object]$obj){
  if(-not $obj.PSObject.Properties.Name.Contains('expo')){
    $obj | Add-Member -NotePropertyName expo -NotePropertyValue ([pscustomobject]@{})
  }
  if(-not $obj.expo.PSObject.Properties.Name.Contains('android')){
    $obj.expo | Add-Member -NotePropertyName android -NotePropertyValue ([pscustomobject]@{})
  }
  if(-not $obj.expo.PSObject.Properties.Name.Contains('ios')){
    $obj.expo | Add-Member -NotePropertyName ios -NotePropertyValue ([pscustomobject]@{})
  }
}

function Set-AppIds {
  param([string]$AndroidPackage,[string]$iOSBundleId)
  $app = Get-AppJson
  Ensure-ExpoNodes $app

  if ($AndroidPackage){
    if($app.expo.android.PSObject.Properties.Name -notcontains 'package'){
      $app.expo.android | Add-Member -NotePropertyName package -NotePropertyValue $AndroidPackage
    } else { $app.expo.android.package = $AndroidPackage }
    Write-Info "android.package = $AndroidPackage"
  }
  if ($iOSBundleId){
    if($app.expo.ios.PSObject.Properties.Name -notcontains 'bundleIdentifier'){
      $app.expo.ios | Add-Member -NotePropertyName bundleIdentifier -NotePropertyValue $iOSBundleId
    } else { $app.expo.ios.bundleIdentifier = $iOSBundleId }
    Write-Info "ios.bundleIdentifier = $iOSBundleId"
  }
  Save-AppJson $app
}

function Get-CurrentVersions {
  $app = Get-AppJson
  Ensure-ExpoNodes $app
  $curAndroid = if($app.expo.android.PSObject.Properties.Name -contains 'versionCode'){ [int]$app.expo.android.versionCode } else { 0 }
  $curIos     = if($app.expo.ios.PSObject.Properties.Name -contains 'buildNumber'){ [int]$app.expo.ios.buildNumber } else { 0 }
  [pscustomobject]@{ Android=$curAndroid; iOS=$curIos }
}

function Set-AppJsonVersion {
  param([int]$AndroidVersionCode,[string]$iOSBuildNumber)
  $app = Get-AppJson
  Ensure-ExpoNodes $app

  if ($app.expo.android.PSObject.Properties.Name -notcontains 'versionCode'){
    $app.expo.android | Add-Member -NotePropertyName versionCode -NotePropertyValue $AndroidVersionCode
  } else { $app.expo.android.versionCode = $AndroidVersionCode }

  if ($app.expo.ios.PSObject.Properties.Name -notcontains 'buildNumber'){
    $app.expo.ios | Add-Member -NotePropertyName buildNumber -NotePropertyValue $iOSBuildNumber
  } else { $app.expo.ios.buildNumber = $iOSBuildNumber }

  Save-AppJson $app
  Write-Info "Updated versions -> android.versionCode=$AndroidVersionCode, ios.buildNumber=$iOSBuildNumber"
}

function Ensure-Tools {
  $hasEas = (npm ls eas-cli -p --depth=0 2>$null) -or (Get-Command eas -ErrorAction SilentlyContinue)
  if(-not $hasEas){ Write-Warn "eas-cli not found locally. Installing devDependency..."; npm i -D eas-cli | Out-Null }
  Write-Info "Ensuring SDK-aligned deps (expo-font, @expo/vector-icons, expo-notifications)…"
  npx expo install expo-font @expo/vector-icons expo-notifications | Out-Null
}

function Build-AndroidApk { Write-Info "EAS Android APK build…"; npx eas build -p android --profile android-apk }
function Build-AndroidAab { Write-Info "EAS Android AAB build…"; npx eas build -p android --profile android-aab }
function Build-iOSAdHoc   { Write-Info "EAS iOS Ad Hoc build…";  npx eas build -p ios --profile ios-adhoc }
function Build-iOSTF      { Write-Info "EAS iOS TestFlight build…"; npx eas build -p ios --profile ios-testflight }
function Submit-iOS       { Write-Info "Submitting to App Store Connect…"; npx eas submit -p ios }

function Find-LastFile([string]$ExtPattern){
  $dl = Join-Path $env:USERPROFILE 'Downloads'
  if(-not (Test-Path $dl)){ return $null }
  Get-ChildItem -Path $dl -Filter $ExtPattern -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
function Install-LastApk {
  $apk = Find-LastFile '*.apk'
  if(-not $apk){ throw "No .apk found in $env:USERPROFILE\Downloads" }
  $adb = Get-Command adb -ErrorAction SilentlyContinue
  if(-not $adb){ throw "adb not found. Add Android SDK platform-tools to PATH." }
  Write-Info "Installing APK: $($apk.FullName)"
  & adb devices
  & adb install -r $apk.FullName
  Write-Info "APK install complete."
}

function Clean-Gradle {
  Write-Warn "Stopping Gradle and clearing caches…"
  if(Test-Path ".\android\gradlew"){ pushd android; .\gradlew --stop; popd }
  if(Test-Path "$env:USERPROFILE\.gradle"){ Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle" }
  if(Test-Path ".\android\.gradle"){ Remove-Item -Recurse -Force ".\android\.gradle" }
  if(Test-Path ".\android\app\build"){ Remove-Item -Recurse -Force ".\android\app\build" }
  Write-Info "Gradle cleanup done."
}

# -------------------- DRIVER --------------------
Assert-File (Join-Path (Get-Location) 'app.json')
Ensure-Tools

if($CleanGradle){ Clean-Gradle }

if($SetIds){ Set-AppIds -AndroidPackage $AndroidPackage -iOSBundleId $iOSBundleId }

if($AutoIncrement){
  $v = Get-CurrentVersions
  $AndroidVersionCode = [math]::Max(1, $v.Android + 1)
  $iOSBuildNumber     = [string]([math]::Max(1, $v.iOS + 1))
  $SetVersions = $true
}
if($SetVersions){
  Set-AppJsonVersion -AndroidVersionCode $AndroidVersionCode -iOSBuildNumber $iOSBuildNumber
}

if($BuildAndroidApk){ Build-AndroidApk }
if($BuildAndroidAab){ Build-AndroidAab }
if($BuildIosAdHoc){ Build-iOSAdHoc }
if($BuildIosTestFlight){ Build-iOSTF }
if($SubmitIos){ Submit-iOS }
if($InstallLastApk){ Install-LastApk }

Write-Info "Done."
