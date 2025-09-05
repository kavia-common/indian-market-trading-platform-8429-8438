#!/bin/bash
cd /home/kavia/workspace/code-generation/indian-market-trading-platform-8429-8438/algo_trading_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

