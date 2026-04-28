@echo off
echo Starting G-Bid Platform Services...

start cmd /k "cd contracts && npx hardhat node"
timeout /t 5
start cmd /k "cd contracts && npx hardhat run scripts/deploy.js --network localhost"
start cmd /k "cd backend && npm run dev"
start cmd /k "cd ai-service && python main.py"
start cmd /k "cd frontend && npm run dev"

echo All services launched! Check individual windows for logs.
pause
