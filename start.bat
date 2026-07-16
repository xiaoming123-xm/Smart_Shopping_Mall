@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "ROOT=%~dp0"
set "API=%~dp0apps\api-server"
set "PROFILE=local"
set "PNPM=pnpm"

if /I "%~1"=="h2" set "PROFILE=h2"

echo ========================================
echo       Smart Shopping Mall Launcher
echo ========================================
echo Profile: %PROFILE%
echo.

if not exist "%API%\mall-bootstrap" (
    echo [ERROR] Spring Boot module was not found:
    echo %API%\mall-bootstrap
    pause
    exit /b 1
)

where pnpm >nul 2>&1
if errorlevel 1 (
    where corepack >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] pnpm was not found, and Corepack was not found either.
        echo Install pnpm with: npm install -g pnpm
        pause
        exit /b 1
    )
    set "PNPM=corepack pnpm"
)

if not exist "%ROOT%node_modules" (
    echo [INFO] node_modules was not found. Installing workspace dependencies...
    call %PNPM% install
    if errorlevel 1 (
        echo [ERROR] pnpm install failed.
        pause
        exit /b 1
    )
)

if /I "%PROFILE%"=="local" (
    echo [1/4] Checking persistent database...
    call :check_local_database
    if errorlevel 1 (
        echo.
        echo [ERROR] The local MySQL database is not ready.
        echo Make sure MySQL is running and application-local.yml points to a valid database.
        echo Current default expects: localhost:3306 / database smart_mall / user root.
        pause
        exit /b 1
    )
) else (
    echo [1/4] H2 mode selected. No external database will be started.
)

echo.
echo [2/4] Starting Spring Boot API with profile: %PROFILE%...

if exist "%API%\mvnw.cmd" (
    start "Smart Mall - API (%PROFILE%)" /D "%API%" cmd /k "call mvnw.cmd -pl mall-bootstrap -am -DskipTests package && java -jar mall-bootstrap\target\mall-bootstrap-0.1.0-SNAPSHOT.jar --spring.profiles.active=%PROFILE%"
) else (
    where mvn >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Neither mvnw.cmd nor Maven was found.
        pause
        exit /b 1
    )
    start "Smart Mall - API (%PROFILE%)" /D "%API%" cmd /k "mvn -pl mall-bootstrap -am -DskipTests package && java -jar mall-bootstrap\target\mall-bootstrap-0.1.0-SNAPSHOT.jar --spring.profiles.active=%PROFILE%"
)

timeout /t 3 /nobreak >nul

echo [3/4] Starting admin web...
start "Smart Mall - Admin" /D "%ROOT%" cmd /k "%PNPM% --filter admin-web dev"

echo [4/4] Starting storefront web...
start "Smart Mall - Storefront" /D "%ROOT%" cmd /k "%PNPM% --filter storefront-web dev"

echo.
echo [OK] Startup windows have been opened.
echo Backend profile: %PROFILE%
echo.
echo Admin and storefront URLs will be shown in their own windows.
echo API will be available after Spring Boot finishes starting.
timeout /t 4 /nobreak >nul
exit /b 0

:check_local_database
set "DB_CONFIG=%API%\mall-bootstrap\src\main\resources\application-local.yml"

if not exist "%DB_CONFIG%" (
    echo [ERROR] Configuration file was not found:
    echo %DB_CONFIG%
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$cfg=Get-Content -LiteralPath '%DB_CONFIG%' -Raw; $m=[regex]::Match($cfg,'(?i)jdbc:mysql://([^/:?]+):(\d+)/([^?\r\n]+)'); if(-not $m.Success){Write-Host '[ERROR] Could not detect a MySQL JDBC URL in application-local.yml.'; exit 1}; $dbHost=$m.Groups[1].Value; $dbPort=[int]$m.Groups[2].Value; $dbName=$m.Groups[3].Value; if($dbHost -notin @('localhost','127.0.0.1','::1')){Write-Host ('[OK] Remote persistent database configured: '+$dbHost+':'+$dbPort+'/'+$dbName); exit 0}; $tcp=New-Object Net.Sockets.TcpClient; try{$iar=$tcp.BeginConnect($dbHost,$dbPort,$null,$null); if(-not $iar.AsyncWaitHandle.WaitOne(2000,$false)){throw 'timeout'}; $tcp.EndConnect($iar); $tcp.Close(); Write-Host ('[OK] MySQL port is reachable: '+$dbHost+':'+$dbPort+'/'+$dbName); exit 0}catch{Write-Host ('[WARN] MySQL port is not reachable: '+$dbHost+':'+$dbPort+'/'+$dbName)}; $services=@(Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'mysql|maria' -or $_.DisplayName -match 'mysql|maria' }); if($services.Count -eq 0){Write-Host '[ERROR] No MySQL/MariaDB Windows service was found.'; exit 1}; $svc=$services | Sort-Object @{Expression={if($_.Status -eq 'Running'){0}else{1}}},Name | Select-Object -First 1; if($svc.Status -ne 'Running'){try{Start-Service -Name $svc.Name -ErrorAction Stop; $svc.WaitForStatus('Running',[TimeSpan]::FromSeconds(20))}catch{Write-Host ('[ERROR] Failed to start database service '+$svc.Name+'. Run start.bat as Administrator.'); exit 1}}; Write-Host ('[OK] Persistent database service is running: '+$svc.Name); exit 0"
exit /b %errorlevel%
