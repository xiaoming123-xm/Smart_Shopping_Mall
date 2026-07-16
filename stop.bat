@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "ROOT=%~dp0"
set "STOP_DB=0"

if /I "%~1"=="db" set "STOP_DB=1"
if /I "%~1"=="database" set "STOP_DB=1"
if /I "%~1"=="mysql" set "STOP_DB=1"

echo ========================================
echo       Smart Shopping Mall Stopper
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$root='%ROOT%'.TrimEnd('\'); $stopDb='%STOP_DB%' -eq '1'; $selfPid=$PID; $all=Get-CimInstance Win32_Process; $targets=@(); foreach($p in $all){$cmd=[string]$p.CommandLine; if([string]::IsNullOrWhiteSpace($cmd) -or [int]$p.ProcessId -eq $selfPid -or $cmd -like '*Get-CimInstance Win32_Process*'){continue}; $isApiJar=($cmd -like '*mall-bootstrap\target\mall-bootstrap-0.1.0-SNAPSHOT.jar*'); $isApiMaven=($cmd -like '*mall-bootstrap*' -and $cmd -like '*spring-boot:run*'); $isWeb=($cmd -like '*--filter admin-web dev*' -or $cmd -like '*--filter storefront-web dev*' -or $cmd -like '*pnpm dev:admin*' -or $cmd -like '*pnpm dev:storefront*' -or (($cmd -like '*vite*') -and ($cmd -like '*admin-web*' -or $cmd -like '*storefront-web*' -or $cmd -like ('*'+$root+'*')))); if($isApiJar -or $isApiMaven -or ($isWeb -and $cmd -like ('*'+$root+'*'))){$targets += $p}}; $ids=New-Object 'System.Collections.Generic.HashSet[int]'; function AddTree([int]$procId){ if(-not $ids.Add($procId)){return}; foreach($child in $all | Where-Object { $_.ParentProcessId -eq $procId -and $_.ProcessId -ne $selfPid }){ AddTree ([int]$child.ProcessId) } }; foreach($t in $targets){ AddTree ([int]$t.ProcessId) }; if($ids.Count -eq 0){ Write-Host '[INFO] No Smart Shopping Mall API or web dev processes were found.' } else { $ordered=$ids | Sort-Object -Descending; foreach($id in $ordered){ try { $proc=Get-Process -Id $id -ErrorAction Stop; Write-Host ('[STOP] '+$proc.ProcessName+' PID '+$id); Stop-Process -Id $id -Force -ErrorAction Stop } catch {} } Write-Host ('[OK] Stopped '+$ids.Count+' process(es).') }; if($stopDb){ $svc=Get-Service -Name 'MySQL80' -ErrorAction SilentlyContinue; if($null -eq $svc){ Write-Host '[WARN] MySQL80 service was not found.' } elseif($svc.Status -eq 'Stopped'){ Write-Host '[OK] MySQL80 is already stopped.' } else { try { Stop-Service -Name 'MySQL80' -ErrorAction Stop; Write-Host '[OK] MySQL80 stop requested.' } catch { Write-Host '[ERROR] Failed to stop MySQL80. Run stop.bat as Administrator.'; exit 1 } } } else { Write-Host '[INFO] Database was left running. Use stop.bat db to stop MySQL80 too.' }"
set "STOP_ERROR=%ERRORLEVEL%"

echo.
echo Done.
timeout /t 3 /nobreak >nul 2>nul
exit /b %STOP_ERROR%
