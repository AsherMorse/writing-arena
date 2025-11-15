#!/bin/bash

# Test all grading API endpoints

echo "🧪 TESTING GRADING API ENDPOINTS"
echo "================================="
echo ""

BASE_URL="http://localhost:3000"

# Test sample writing
SAMPLE_WRITING="The ancient lighthouse, a weathered stone sentinel, stood on the cliff. I approached it cautiously because the mysterious golden light intrigued me. However, when I opened the rusty door, it creaked loudly. Inside, the dusty room was filled with old equipment, but in the center sat a glowing wooden chest."

echo "📝 Testing Phase 1: /api/analyze-writing"
echo "Writing sample: '$SAMPLE_WRITING'"
echo ""

curl -X POST "$BASE_URL/api/analyze-writing" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$SAMPLE_WRITING\", \"trait\": \"all\", \"promptType\": \"narrative\"}" \
  2>/dev/null | jq '{overallScore, strengths: .strengths[0:2], improvements: .improvements[0:2]}'

echo ""
echo "---"
echo ""

echo "📝 Testing Phase 2: /api/evaluate-peer-feedback"
echo ""

curl -X POST "$BASE_URL/api/evaluate-peer-feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "clarity": "Your opening uses an appositive (The lighthouse, a weathered sentinel) which is a TWR strategy that adds description efficiently.",
      "strengths": "The phrase \"because the mysterious light\" shows sentence expansion (TWR) - you show WHY you approached it.",
      "improvements": "In sentence 3, you could combine (TWR): \"The rusty door creaked loudly when I opened it\" instead of two sentences.",
      "organization": "Good use of transition word \"However\" (TWR) to signal change.",
      "engagement": "The glowing chest creates mystery."
    },
    "peerWriting": "'"$SAMPLE_WRITING"'"
  }' 2>/dev/null | jq '{score, strengths: .strengths[0:1], improvements: .improvements[0:1]}'

echo ""
echo "---"
echo ""

echo "📝 Testing Phase 3: /api/generate-feedback"
echo ""

curl -X POST "$BASE_URL/api/generate-feedback" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"I found my keys and my day was fine.\", \"promptType\": \"narrative\"}" \
  2>/dev/null | jq '{score, strengths: .strengths[0:2], improvements: .improvements[0:2]}'

echo ""
echo "---"
echo ""

echo "📝 Testing Phase 3: /api/evaluate-revision"
echo ""

ORIGINAL="I found my keys. My day was fine."
REVISED="I found my keys, the silver house keys I'd been searching for all morning, and my day was finally fine because I could leave for work."

curl -X POST "$BASE_URL/api/evaluate-revision" \
  -H "Content-Type: application/json" \
  -d "{
    \"originalContent\": \"$ORIGINAL\",
    \"revisedContent\": \"$REVISED\",
    \"feedback\": {
      \"improvements\": [
        \"Add an appositive for description\",
        \"Expand with because to show thinking\",
        \"Combine short sentences\"
      ]
    }
  }" 2>/dev/null | jq '{score, improvements: .improvements[0:2], strengths: .strengths[0:2]}'

echo ""
echo "================================="
echo "✅ API ENDPOINT TESTS COMPLETE"
echo ""
echo "Check output above for:"
echo "  - TWR strategy mentions (appositive, expansion, combining, etc.)"
echo "  - Specific quotes from student text"
echo "  - Concrete revision suggestions"
echo ""

