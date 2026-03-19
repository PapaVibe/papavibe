@echo off
cd /d C:\Users\petro\.openclaw\workspace\papavibe
echo --- BAD SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.bad.json
echo.
echo --- GOOD SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.good.json
echo.
echo --- MANUAL REVIEW SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.manual.json
