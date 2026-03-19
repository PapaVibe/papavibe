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
echo.
echo --- MISSING AMOUNT SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.missing-amount.json
echo.
echo --- ACTION TYPE MISMATCH SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.action-mismatch.json
echo.
echo --- AMOUNT TOO HIGH SCENARIO ---
node .\examples\host-agent-demo.js .\examples\review-request.amount-too-high.json
