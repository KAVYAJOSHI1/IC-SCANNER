#!/bin/bash
cd ui
echo "Installing dependencies..."
npm install
echo "Starting frontend..."
npm run dev -- --host
