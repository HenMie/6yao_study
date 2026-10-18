@echo off
chcp 936 >nul
cd /d %~dp0web

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org/
    echo 安装完成后重新双击本脚本即可。
    pause
    exit /b 1
)

if not exist node_modules (
    echo [提示] 首次运行，正在安装依赖，约需 1-2 分钟...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
)

echo [启动] 六爻学习站开发服务器：http://127.0.0.1:5173
echo 停止方法：按 Ctrl+C，或直接关闭本窗口。

timeout /t 3 >nul
start "" http://127.0.0.1:5173

call npm run dev
if errorlevel 1 pause
