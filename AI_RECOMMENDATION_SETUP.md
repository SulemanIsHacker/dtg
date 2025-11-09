# AI-Powered Recommendation Feature Setup

This document provides setup instructions for the AI-powered recommendation feature using the Gemini API.

## Features Implemented

✅ **AI-Powered Chatbot Interface**
- Conversational chatbot-style interface
- Interactive conversation flow for user requirements
- Clean, modern UI matching website theme
- Responsive design for desktop and mobile

✅ **Gemini API Integration**
- Google Gemini 1.5 Flash model integration
- Intelligent tool recommendation based on user needs
- Natural language processing for user inputs
- Fallback recommendations when AI fails

✅ **User Requirements Collection**
- Purpose identification (video editing, graphic design, SEO, etc.)
- Budget range collection
- Experience level assessment
- Specific feature requirements

✅ **Supabase Integration**
- Real-time product database querying
- Pricing plan integration
- Product feature matching
- Category-based filtering

✅ **Currency Conversion**
- PKR as base currency
- Multi-currency support (USD, EUR, GBP, AED, SAR, CAD, AUD)
- Real-time price conversion
- Currency selector integration

✅ **Recommendation Results**
- Tool name, features, and pricing
- Match score and reasoning
- Direct WhatsApp integration for tool requests
- Clear call-to-action buttons

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root and add:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env` file

### 3. Install Dependencies

The required dependency has already been installed:

```bash
npm install @google/generative-ai
```

### 4. Component Structure

The feature consists of several key components:

- **`src/services/geminiService.ts`** - Gemini API integration service
- **`src/components/AIRecommendationBot.tsx`** - Main chatbot component
- **`src/hooks/useAIRecommendations.tsx`** - Custom hook for AI recommendations
- **`src/pages/AIRecommendations.tsx`** - Dedicated AI recommendations page

### 5. Integration Points

The feature is integrated into:

- **Main App** (`src/App.tsx`) - Floating chatbot button
- **Header Navigation** (`src/components/Header.tsx`) - AI Recommender link
- **Homepage** (`src/pages/Index.tsx`) - AI recommendation section
- **Currency System** - PKR conversion and display

## Usage

### For Users

1. **Floating Chatbot**: Click the floating message button on any page
2. **Dedicated Page**: Visit `/ai-recommendations` for full experience
3. **Navigation**: Use "AI Recommender" in the main navigation

### Conversation Flow

1. **Greeting**: AI asks about user's purpose
2. **Budget**: User specifies budget range
3. **Experience**: User indicates experience level
4. **Specific Needs**: User lists specific features (optional)
5. **Recommendations**: AI provides personalized tool suggestions

### Recommendation Features

- **Match Score**: Percentage indicating how well the tool matches user needs
- **Detailed Reasoning**: Explanation of why each tool is recommended
- **Pricing**: Displayed in user's preferred currency
- **Direct Access**: WhatsApp integration for immediate tool requests

## Customization

### Adding New Tools

Tools are automatically loaded from the Supabase `products` table. To add new tools:

1. Add the tool to the Supabase `products` table
2. Ensure the tool has proper category, features, and pricing information
3. The AI will automatically include it in recommendations

### Modifying Conversation Flow

Edit the conversation logic in `src/components/AIRecommendationBot.tsx`:

```typescript
const handleGreetingResponse = (message: string) => {
  // Customize the greeting response logic
};
```

### Customizing AI Prompts

Modify the AI prompts in `src/services/geminiService.ts`:

```typescript
private buildRecommendationPrompt(userRequirements: UserRequirements, availableTools: any[]): string {
  // Customize the AI prompt for better recommendations
}
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if the API key has proper permissions
   - Ensure the environment variable is loaded correctly

2. **No Recommendations**
   - Check if products exist in Supabase
   - Verify the AI prompt is working correctly
   - Check browser console for errors

3. **Currency Conversion Issues**
   - Verify exchange rates in `useCurrencyConverter.tsx`
   - Check if the currency selector is working

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
VITE_DEBUG_AI=true
```

## Performance Considerations

- **Caching**: Product data is cached for 5 minutes to improve performance
- **Lazy Loading**: Tools are loaded only when needed
- **Error Handling**: Graceful fallbacks when AI service is unavailable
- **Rate Limiting**: Consider implementing rate limiting for API calls

## Security

- **API Key**: Keep your Gemini API key secure and never commit it to version control
- **Input Validation**: All user inputs are validated before sending to AI
- **Error Handling**: Sensitive information is not exposed in error messages

## Future Enhancements

Potential improvements for the future:

1. **User History**: Save user preferences and recommendation history
2. **Advanced Filtering**: More sophisticated filtering options
3. **Comparison Tool**: Side-by-side tool comparison
4. **User Reviews**: Integration with user testimonials
5. **Machine Learning**: Learn from user interactions to improve recommendations

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the Gemini API key independently
4. Contact support through WhatsApp integration
