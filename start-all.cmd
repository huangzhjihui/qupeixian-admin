@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo    趣配鲜 - 一键启动开发环境
echo ========================================
echo.

echo [准备] 清理残留进程...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') do (
    echo    关闭占用端口3000的进程 PID=%%a
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING" 2^>nul') do (
    echo    关闭占用端口5173的进程 PID=%%a
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [1/2] 启动后端服务器...
start "趣配鲜-后端" cmd /k "title 趣配鲜-后端 && set "PATH=e:\qu pei xian\node\node-v20.11.0-win-x64;%PATH%" && cd /d "e:\qu pei xian\backend" && echo 后端启动中... && node src/app.js"

echo       等待后端初始化...
timeout /t 5 /nobreak >nul

echo [2/2] 启动前端开发服务器...
start "趣配鲜-前端" cmd /k "title 趣配鲜-前端 && set "PATH=e:\qu pei xian\node\node-v20.11.0-win-x64;%PATH%" && cd /d "e:\qu pei xian\frontend" && echo 前端启动中... && npx vite --host"

echo.
echo ========================================
echo   启动完成！请在弹出的窗口中确认服务已就绪
echo ========================================
echo.
echo   用户端:   http://localhost:5173
echo   管理端:   http://localhost:5173/admin/login
echo   后端API:  http://localhost:3000/api
echo.
echo   如果页面打不开，请检查:
echo   1. 两个黑色窗口是否都显示正常运行
echo   2. 如果后端窗口闪退，检查端口3000是否被占用
echo   3. 如果前端窗口闪退，检查端口5173是否被占用
echo.
pause
