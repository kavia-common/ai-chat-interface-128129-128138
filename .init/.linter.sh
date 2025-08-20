#!/bin/bash
cd /home/kavia/workspace/code-generation/ai-chat-interface-128129-128138/chatbot_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

