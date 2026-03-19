@echo off
echo Starting PapaVibe backend in a new window...
start "PapaVibe API" cmd /k C:\Users\petro\.openclaw\workspace\papavibe\scripts\start-api.cmd

echo Starting PapaVibe frontend in a new window...
start "PapaVibe Web" cmd /k C:\Users\petro\.openclaw\workspace\papavibe\scripts\start-web.cmd

echo Open demo with:
echo http://localhost:5173/
echo Run check with:
echo C:\Users\petro\.openclaw\workspace\papavibe\scripts\check.cmd
