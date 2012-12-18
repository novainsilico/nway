@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe" "%~dp0\.\node_modules\nway\bin\nway.js" %*
) ELSE (
  node "%~dp0\.\node_modules\nway\bin\nway.js" %*
)