import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('VITE_GEMINI_API_KEY environment variable is not set. AI recommendations will be disabled.');
}

export interface ToolRecommendation {
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string;
  features: string[];
  rating: number;
  reason: string;
  matchScore: number;
  image?: string;
  slug?: string;
}

export interface UserRequirements {
  purpose: string;
  budget: string;
  experience: string;
  specificNeeds: string[];
}

export class GeminiService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) || null;

  constructor() {
    console.log('Gemini API Key loaded:', !!apiKey);
    if (apiKey) {
      console.log('Gemini API Key (first 10 chars):', apiKey.substring(0, 10));
    } else {
      console.log('Gemini AI service disabled - no API key provided');
    }
  }

  private isServiceAvailable(): boolean {
    return this.model !== null;
  }

  // Helper function to parse price strings like "1300 PKR" or "$5"
  private parsePriceString(priceStr: string): number {
    if (!priceStr) return 0;
    // Extract numeric value from strings like "1300 PKR", "$5", "3000 PKR", etc.
    const match = priceStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isServiceAvailable()) {
      console.log('Gemini service not available - API key not configured');
      return false;
    }

    try {
      const result = await this.model!.generateContent('Hello, respond with "API working"');
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API test response:', text);
      return text.includes('API working') || text.length > 0;
    } catch (error) {
      console.error('Gemini API test failed:', error);
      return false;
    }
  }

  async getToolRecommendations(
    userRequirements: UserRequirements,
    availableTools: any[]
  ): Promise<ToolRecommendation[]> {
    if (!this.isServiceAvailable()) {
      console.log('Gemini service not available - returning fallback recommendations');
      return this.getFallbackRecommendations(userRequirements, availableTools);
    }

    try {
      console.log('Getting recommendations with:', { userRequirements, availableToolsCount: availableTools.length });
      
      if (!availableTools || availableTools.length === 0) {
        console.warn('No tools available, using fallback');
        return this.getFallbackRecommendations(userRequirements, []);
      }

      const prompt = this.buildRecommendationPrompt(userRequirements, availableTools);
      console.log('Generated prompt:', prompt);
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response:', text);
      return this.parseRecommendations(text, availableTools, userRequirements);
    } catch (error) {
      console.error('Error getting recommendations from Gemini:', error);
      console.log('Falling back to simple recommendations');
      return this.getFallbackRecommendations(userRequirements, availableTools);
    }
  }

  private buildRecommendationPrompt(userRequirements: UserRequirements, availableTools: any[]): string {
    const toolsData = availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      price: tool.price,
      originalPrice: tool.originalPrice,
      features: tool.features,
      rating: tool.rating
    }));

    return `
You are an expert tool recommendation assistant for DAILYTECH TOOLS SOLUTIONS, a platform that provides premium software tools at discounted prices.

User Requirements:
- Purpose: ${userRequirements.purpose}
- Budget: ${userRequirements.budget}
- Experience Level: ${userRequirements.experience}
- Specific Needs: ${userRequirements.specificNeeds.join(', ')}

Available Tools:
${JSON.stringify(toolsData, null, 2)}

Please analyze the user's requirements and recommend the most suitable tools from the available options. Consider:
1. How well each tool matches the user's purpose
2. Whether the tool fits within their budget
3. The user's experience level
4. Specific features they mentioned

Return your response in the following JSON format:
{
  "recommendations": [
    {
      "toolName": "exact tool name from available tools",
      "reason": "detailed explanation of why this tool is recommended",
      "matchScore": 85,
      "priority": 1
    }
  ],
  "summary": "brief summary of recommendations"
}

Provide 1-3 recommendations, ordered by priority. Match scores should be 0-100.
Only recommend tools that are in the available tools list.
`;
  }

  private parseRecommendations(response: string, availableTools: any[], userRequirements: UserRequirements): ToolRecommendation[] {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recommendations = parsed.recommendations || [];

      return recommendations.map((rec: any) => {
        const tool = availableTools.find(t => t.name === rec.toolName);
        if (!tool) {
          throw new Error(`Tool not found: ${rec.toolName}`);
        }

        return {
          name: tool.name,
          description: tool.description,
          category: tool.category,
          price: tool.price, // Use the numeric price from pricing_plans
          originalPrice: tool.originalPrice, // Use the numeric original price from pricing_plans
          features: tool.features,
          rating: tool.rating,
          reason: rec.reason,
          matchScore: rec.matchScore,
          image: tool.image || tool.main_image_url,
          slug: tool.slug
        };
      });
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      // Fallback: return tools based on category matching
      return this.getFallbackRecommendations(userRequirements, availableTools);
    }
  }

  private getFallbackRecommendations(requirements: UserRequirements, availableTools: any[]): ToolRecommendation[] {
    console.log('Using fallback recommendations for:', requirements);
    
    if (!availableTools || availableTools.length === 0) {
      console.warn('No tools available for fallback');
      return [];
    }

    // Simple fallback logic based on category matching
    const categoryMap: Record<string, string[]> = {
      'video editing': ['Video'],
      'video': ['Video'],
      'graphic design': ['Design', 'Creative'],
      'design': ['Design', 'Creative'],
      'seo': ['SEO'],
      'writing': ['Writing', 'AI'],
      'ai': ['AI'],
      'productivity': ['Productivity'],
      'creative': ['Creative', 'Design']
    };

    const purpose = requirements.purpose?.toLowerCase() || '';
    const relevantCategories = Object.entries(categoryMap)
      .filter(([key]) => purpose.includes(key))
      .flatMap(([, categories]) => categories);

    let filteredTools = availableTools;
    
    if (relevantCategories.length > 0) {
      filteredTools = availableTools.filter(tool => 
        relevantCategories.includes(tool.category)
      );
    }

    // If no category match, return top-rated tools
    if (filteredTools.length === 0) {
      filteredTools = availableTools.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filteredTools.slice(0, 3).map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      price: tool.price || tool.originalPrice || 'N/A',
      originalPrice: tool.originalPrice || tool.price || 'N/A',
      features: tool.features || [],
      rating: tool.rating || 4.5,
      reason: relevantCategories.length > 0 
        ? `This ${tool.category.toLowerCase()} tool matches your needs.`
        : `This is one of our top-rated tools that might interest you.`,
      matchScore: relevantCategories.length > 0 ? 75 : 60,
      image: tool.image || tool.main_image_url,
      slug: tool.slug
    }));
  }

  async getToolRecommendationsFromMessage(
    userMessage: string,
    availableTools: any[],
    conversationContext?: string
  ): Promise<ToolRecommendation[]> {
    if (!this.isServiceAvailable()) {
      console.log('Gemini service not available - returning fallback recommendations from message');
      return this.getFallbackRecommendationsFromMessage(userMessage, availableTools);
    }

    try {
      console.log('Getting recommendations from message:', userMessage);
      console.log('Available tools count:', availableTools.length);
      
      if (!availableTools || availableTools.length === 0) {
        console.warn('No tools available');
        return [];
      }

      // Use conversation context if provided, otherwise use just the current message
      const contextToAnalyze = conversationContext || userMessage;
      
      // Extract tool type and budget from the context
      const { toolType, budget } = this.extractToolTypeAndBudget(contextToAnalyze);
      console.log('Extracted tool type:', toolType, 'budget:', budget);

      const prompt = this.buildMessageBasedPrompt(contextToAnalyze, availableTools);
      console.log('Generated prompt:', prompt);
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response:', text);
      return this.parseRecommendations(text, availableTools, { 
        purpose: toolType || userMessage, 
        budget: budget || '', 
        experience: '', 
        specificNeeds: [] 
      });
    } catch (error) {
      console.error('Error getting recommendations from message:', error);
      console.log('Falling back to simple recommendations');
      return this.getFallbackRecommendationsFromMessage(userMessage, availableTools);
    }
  }

  private buildMessageBasedPrompt(userMessage: string, availableTools: any[]): string {
    const toolsData = availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      price: tool.price, // This is now the numeric price from pricing_plans
      originalPrice: tool.originalPrice, // This is now the numeric original price from pricing_plans
      priceFormatted: tool.priceFormatted, // Formatted price like "$5"
      originalPriceFormatted: tool.originalPriceFormatted, // Formatted original price like "$20"
      features: tool.features,
      rating: tool.rating,
      cheapestPlan: tool.cheapestPlan // The actual pricing plan data
    }));

    return `
You are an expert tool recommendation assistant for DAILYTECH TOOLS SOLUTIONS, a platform that provides premium software tools at discounted prices.

User Request: "${userMessage}"

Available Tools:
${JSON.stringify(toolsData, null, 2)}

IMPORTANT: You must prioritize tools that match the user's specific request. For example:
- If they ask for "video editing", prioritize tools in Video, AI, or Design categories that are related to video editing
- If they ask for "graphic design", prioritize tools in Design, AI, or Creative categories
- If they ask for "SEO", prioritize tools in SEO & Marketing categories
- If they ask for "AI tools", prioritize tools in AI & Machine Learning categories

Analyze the user's request and recommend the most suitable tools from the available options. Consider:
1. The type of work they mentioned (video editing, graphic design, SEO, writing, etc.) - THIS IS THE MOST IMPORTANT FACTOR
2. Their budget if mentioned
3. Their experience level if indicated
4. Any specific features they requested

Return your response in the following JSON format:
{
  "recommendations": [
    {
      "toolName": "exact tool name from available tools",
      "reason": "detailed explanation of why this tool is recommended based on their request",
      "matchScore": 85,
      "priority": 1
    }
  ],
  "summary": "brief summary of recommendations"
}

Provide 1-3 recommendations, ordered by priority. Match scores should be 0-100.
ONLY recommend tools that are directly relevant to the user's request. Do not recommend unrelated tools.
If the user's request is unclear, make reasonable assumptions based on common use cases.
`;
  }

  private getFallbackRecommendationsFromMessage(userMessage: string, availableTools: any[]): ToolRecommendation[] {
    console.log('Using fallback recommendations for message:', userMessage);
    
    if (!availableTools || availableTools.length === 0) {
      console.log('No tools available for fallback, returning empty array');
      return [];
    }

    const message = userMessage.toLowerCase();
    
    // Simple keyword matching
    const categoryMap: Record<string, string[]> = {
      'video': ['Video'],
      'edit': ['Video', 'Design'],
      'design': ['Design', 'Creative'],
      'graphic': ['Design', 'Creative'],
      'seo': ['SEO'],
      'search': ['SEO'],
      'writing': ['Writing', 'AI'],
      'content': ['Writing', 'AI'],
      'ai': ['AI'],
      'artificial': ['AI'],
      'productivity': ['Productivity'],
      'creative': ['Creative', 'Design'],
      'photo': ['Design', 'Creative'],
      'image': ['Design', 'Creative'],
      'chat': ['AI'],
      'gpt': ['AI'],
      'canva': ['Design'],
      'adobe': ['Creative', 'Design']
    };

    const relevantCategories = Object.entries(categoryMap)
      .filter(([key]) => message.includes(key))
      .flatMap(([, categories]) => categories);

    let filteredTools = availableTools;
    
    if (relevantCategories.length > 0) {
      filteredTools = availableTools.filter(tool => 
        relevantCategories.includes(tool.category)
      );
    }

    // If no category match, return top-rated tools
    if (filteredTools.length === 0) {
      filteredTools = availableTools.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const recommendations = filteredTools.slice(0, 3).map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      price: tool.price || '10', // This should already be parsed numeric value
      originalPrice: tool.originalPrice || '50', // This should already be parsed numeric value
      features: tool.features || [],
      rating: tool.rating || 4.5,
      reason: relevantCategories.length > 0 
        ? `This ${tool.category.toLowerCase()} tool is perfect for your needs.`
        : `This is one of our top-rated tools that might interest you based on your request.`,
      matchScore: relevantCategories.length > 0 ? 75 : 60,
      image: tool.image || tool.main_image_url,
      slug: tool.slug
    }));

    console.log('Fallback recommendations generated:', recommendations);
    return recommendations;
  }

  async generateConversationResponse(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    if (!this.isServiceAvailable()) {
      console.log('Gemini service not available - returning fallback conversation response');
      return "I'm here to help you find the perfect tools! What kind of software are you looking for?";
    }

    try {
      // Check if this is the first message or if we need more info
      const isFirstMessage = conversationHistory.length === 0;
      const { toolType, budget } = this.extractToolTypeAndBudget(userMessage);
      
      // Build a prompt for the AI to respond naturally
      let prompt = `You are a helpful assistant for DAILYTECH TOOLS SOLUTIONS, helping users find the right premium software tools.

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Message: ${userMessage}

`;

      if (isFirstMessage || !toolType) {
        prompt += `Ask what kind of tool they need. Be friendly and give examples like video editing, graphic design, SEO, AI tools, etc.`;
      } else if (!budget) {
        prompt += `The user mentioned they need ${toolType} tools. Ask them about their budget in PKR. Be friendly and give examples like 1000 PKR, under 5000 PKR, etc.`;
      } else {
        prompt += `The user wants ${toolType} tools within their budget of ${budget}. Tell them you'll find the best tools and search the database. Be enthusiastic and helpful.`;
      }

      prompt += `\n\nKeep your response concise and friendly.`;

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error generating conversation response:', error);
      throw error; // Re-throw the error so the calling code can handle it
    }
  }

  extractToolTypeAndBudget(message: string): { toolType: string | null; budget: string | null } {
    const lowerMessage = message.toLowerCase();
    
    console.log('Extracting from message:', message);
    
    // Extract tool type - prioritize longer, more specific keywords first
    const toolTypeKeywords = [
      'video editing', 'graphic design', 'photo editing', 'web development', 
      'machine learning', 'video', 'editing', 'graphic', 'design', 'seo', 
      'writing', 'ai', 'productivity', 'marketing', 'animation', 'coding', 
      'development', 'analytics'
    ];
    
    let toolType = null;
    for (const keyword of toolTypeKeywords) {
      if (lowerMessage.includes(keyword)) {
        toolType = keyword;
        console.log('Found tool type:', toolType);
        break;
      }
    }
    
    // Extract budget in PKR - be more flexible with patterns
    const budgetPatterns = [
      /(\d+)\s*pkr/i,
      /(\d+)\s*rupees/i,
      /under\s*(\d+)\s*pkr/i,
      /less than\s*(\d+)\s*pkr/i,
      /maximum\s*(\d+)\s*pkr/i,
      /budget.*(\d+)\s*pkr/i,
      /(\d+)\s*-\s*(\d+)\s*pkr/i,
      /(\d+)\s*to\s*(\d+)\s*pkr/i,
      // Also match just numbers that might be budgets
      /\b(\d{3,})\b/ // Match 3+ digit numbers that could be budgets
    ];
    
    let budget = null;
    for (const pattern of budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[2]) {
          budget = `${match[1]}-${match[2]} PKR`;
        } else {
          // If it's just a number, assume it's PKR
          const amount = match[1];
          if (amount && parseInt(amount) > 0) {
            budget = `${amount} PKR`;
          }
        }
        console.log('Found budget:', budget);
        break;
      }
    }
    
    console.log('Extraction result:', { toolType, budget });
    return { toolType, budget };
  }
}

export const geminiService = new GeminiService();