#!/bin/bash

echo "🔥 RUNNING EXTREME TESTS 🔥"
echo "================================"
echo ""

echo "📊 Test Suite Overview:"
echo "  - Unit Tests: Basic functionality"
echo "  - Stress Tests: High load scenarios"
echo "  - Edge Cases: Boundary conditions"
echo "  - Chaos Tests: Random failures"
echo "  - Integration Tests: Hook behavior"
echo ""

echo "🧪 Running Unit Tests..."
npm run test:ci -- --testPathPattern="__tests__/(lib|integration)/.*test\.ts$" --verbose

echo ""
echo "💥 Running Stress Tests..."
npm run test:ci -- --testPathPattern="__tests__/stress" --verbose --maxWorkers=1

echo ""
echo "⚡ Running Edge Case Tests..."
npm run test:ci -- --testPathPattern="__tests__/edge-cases" --verbose

echo ""
echo "🌀 Running Chaos Tests..."
npm run test:ci -- --testPathPattern="__tests__/chaos" --verbose --maxWorkers=1

echo ""
echo "================================"
echo "✅ ALL EXTREME TESTS COMPLETE"
echo "================================"

