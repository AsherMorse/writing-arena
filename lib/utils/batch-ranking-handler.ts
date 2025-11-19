import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';

/**
 * Options for creating a batch ranking handler
 */
interface BatchRankingOptions<TSubmission, TRanking> {
  endpointName: string;
  requestBodyKey: string; // 'writings' | 'feedbackSubmissions' | 'revisionSubmissions'
  getPrompt: (submissions: TSubmission[], ...args: any[]) => string;
  parseRankings: (claudeResponse: string, submissions: TSubmission[]) => TRanking[];
  generateMockRankings: (submissions: TSubmission[]) => { rankings: TRanking[] };
  maxTokens?: number;
  getAdditionalBodyParams?: (requestBody: any) => any[];
}

/**
 * Create a batch ranking API handler
 * Consolidates common patterns across batch ranking endpoints
 */
export function createBatchRankingHandler<TSubmission, TRanking>(
  options: BatchRankingOptions<TSubmission, TRanking>
) {
  return async (request: NextRequest) => {
    // Read request body once and store it
    const requestBody = await request.json();
    const submissions = requestBody[options.requestBodyKey];

    if (!submissions || !Array.isArray(submissions)) {
      console.error(`❌ ${options.endpointName} - Invalid request body`);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    try {
      logApiKeyStatus(options.endpointName);

      const apiKey = getAnthropicApiKey();
      if (!apiKey) {
        console.warn(`⚠️ ${options.endpointName} - API key missing, using MOCK rankings`);
        console.warn(`⚠️ ${options.endpointName} - MOCK rankings will be used - scores may not reflect actual quality`);
        console.warn(`⚠️ ${options.endpointName} - To use real AI evaluation, set ANTHROPIC_API_KEY environment variable`);
        const mockRankings = options.generateMockRankings(submissions);
        console.log(`📊 ${options.endpointName} - Mock rankings generated:`, 
          mockRankings.rankings?.map((r: any) => ({ 
            player: r.playerName, 
            score: r.score, 
            isEmpty: !r.content || r.content.trim().length === 0 || r.wordCount === 0 
          }))
        );
        return NextResponse.json(mockRankings);
      }

      console.log(`✅ ${options.endpointName} - Using real AI evaluation for ${submissions.length} submissions`);

      // Get additional prompt arguments if needed
      const additionalArgs = options.getAdditionalBodyParams
        ? options.getAdditionalBodyParams(requestBody)
        : [];

      // Call Claude API to rank all submissions together
      const rankingPrompt = options.getPrompt(submissions, ...additionalArgs);
      const aiResponse = await callAnthropicAPI(apiKey, rankingPrompt, options.maxTokens || 3000);
      const rankingsArray = options.parseRankings(aiResponse.content[0].text, submissions);

      console.log(`✅ ${options.endpointName} - AI evaluation complete, scores:`,
        rankingsArray?.map((r: any) => `${r.playerName}: ${r.score}`).join(', '));

      return NextResponse.json({ rankings: rankingsArray });
    } catch (error) {
      console.error(`❌ ${options.endpointName} - Error:`, error);
      console.warn(`⚠️ ${options.endpointName} - Falling back to MOCK rankings`);
      return NextResponse.json(options.generateMockRankings(submissions));
    }
  };
}

