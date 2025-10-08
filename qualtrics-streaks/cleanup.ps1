# cleanup.ps1  (drop this in the repo)
# Kills stray node processes, deletes node_modules and lockfiles, and reinstalls.

$ErrorActionPreference = 'Stop'

# Stop Metro/Node if running
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove node_modules (PowerShell way)
if (Test-Path .\node_modules) {
  Remove-Item -Recurse -Force .\node_modules
}

# Remove npm lockfile if present
if (Test-Path .\package-lock.json) {
  Remove-Item -Force .\package-lock.json
}

# Fresh install
npm install

# Make sure screens is correct (you’re already good, but safe to keep)
npm install react-native-screens@4.16.0 --save-exact

# Optional: ensure plugins you rely on are present
npx expo install expo-build-properties expo-notifications expo-font
