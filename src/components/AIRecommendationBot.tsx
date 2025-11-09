import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  Bot, 
  User, 
  Send, 
  X, 
  Sparkles, 
  Star, 
  CheckCircle,
  Loader2,
  MessageSquare,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { geminiService, UserRequirements, ToolRecommendation } from '../services/geminiService';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { supabase } from '../integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'recommendations' | 'requirements';
  data?: any;
}

interface AIRecommendationBotProps {
  className?: string;
  variant?: 'floating' | 'embedded';
}

export const AIRecommendationBot: React.FC<AIRecommendationBotProps> = ({ 
  className = '', 
  variant = 'floating' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'purpose' | 'budget' | 'experience' | 'specific' | 'recommendations'>('greeting');
  const [userRequirements, setUserRequirements] = useState<Partial<UserRequirements>>({});
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { formatCurrency } = useCurrencyConverter();

  // Load available tools on component mount
  useEffect(() => {
    loadAvailableTools();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAvailableTools = async () => {
    try {
      const response = await (supabase as any)
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (response.error) throw response.error;
      setAvailableTools(response.data || []);
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'recommendations' | 'requirements' = 'text', data?: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type,
      data
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);

    setIsLoading(true);

    try {
      if (currentStep === 'greeting') {
        handleGreetingResponse(userMessage);
      } else if (currentStep === 'purpose') {
        handlePurposeResponse(userMessage);
      } else if (currentStep === 'budget') {
        handleBudgetResponse(userMessage);
      } else if (currentStep === 'experience') {
        handleExperienceResponse(userMessage);
      } else if (currentStep === 'specific') {
        handleSpecificResponse(userMessage);
      } else {
        // General conversation
        const response = await geminiService.generateConversationResponse(userMessage, messages);
        addMessage('assistant', response);
      }
    } catch (error) {
      addMessage('assistant', "I'm sorry, I encountered an error. Please try again or contact our support team.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGreetingResponse = (message: string) => {
    setUserRequirements(prev => ({ ...prev, purpose: message }));
    setCurrentStep('budget');
    addMessage('assistant', "Great! Now, what's your budget range for a tool subscription? You can say something like 'under $10', '$20-50', or 'flexible'.");
  };

  const handlePurposeResponse = (message: string) => {
    setUserRequirements(prev => ({ ...prev, purpose: message }));
    setCurrentStep('budget');
    addMessage('assistant', "Perfect! Now, what's your budget range for a tool subscription? You can say something like 'under $10', '$20-50', or 'flexible'.");
  };

  const handleBudgetResponse = (message: string) => {
    setUserRequirements(prev => ({ ...prev, budget: message }));
    setCurrentStep('experience');
    addMessage('assistant', "Got it! What's your experience level with these types of tools? Are you a beginner, intermediate, or advanced user?");
  };

  const handleExperienceResponse = (message: string) => {
    setUserRequirements(prev => ({ ...prev, experience: message }));
    setCurrentStep('specific');
    addMessage('assistant', "Excellent! Are there any specific features or capabilities you're looking for? For example, 'AI-powered', 'collaboration features', 'mobile app', etc. You can list multiple or say 'not sure'.");
  };

  const handleSpecificResponse = async (message: string) => {
    const specificNeeds = message.toLowerCase().includes('not sure') ? [] : message.split(',').map(s => s.trim());
    const finalRequirements: UserRequirements = {
      ...userRequirements,
      specificNeeds
    } as UserRequirements;

    setUserRequirements(finalRequirements);
    setCurrentStep('recommendations');

    addMessage('assistant', "Perfect! Let me analyze your requirements and find the best tools for you. This might take a moment...");

    try {
      const recs = await geminiService.getToolRecommendations(finalRequirements, availableTools);
      setRecommendations(recs);
      
      addMessage('assistant', `Based on your requirements, I've found ${recs.length} great tool${recs.length > 1 ? 's' : ''} for you!`, 'recommendations', recs);
    } catch (error) {
      addMessage('assistant', "I'm sorry, I couldn't generate recommendations right now. Please try again or contact our support team for personalized assistance.");
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentStep('greeting');
    setUserRequirements({});
    setRecommendations([]);
    addMessage('assistant', "Hi! I'm your AI assistant here to help you find the perfect premium tool. What do you need a tool for? (e.g., video editing, graphic design, SEO, writing, etc.)");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getWhatsAppMessage = (tool: ToolRecommendation) => {
    return `Hi! I'm interested in ${tool.name} based on your AI recommendation. Can you help me get access to this tool?`;
  };

  const RecommendationCard: React.FC<{ recommendation: ToolRecommendation }> = ({ recommendation }) => (
    <Card className="w-full mb-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{recommendation.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{recommendation.category}</Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{recommendation.rating}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {recommendation.matchScore}% match
              </Badge>
            </div>
          </div>
          {recommendation.image && (
            <Avatar className="w-12 h-12">
              <AvatarImage src={recommendation.image} alt={recommendation.name} />
              <AvatarFallback>{recommendation.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-3">{recommendation.description}</p>
        
        <div className="mb-3">
          <h4 className="font-medium text-sm mb-2">Key Features:</h4>
          <div className="flex flex-wrap gap-1">
            {recommendation.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {recommendation.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recommendation.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Why this tool?</h4>
          <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(parseFloat(recommendation.price.replace('$', '')) * 280, true)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(parseFloat(recommendation.originalPrice.replace('$', '')) * 280, true)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Genuine License</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => {
            const message = getWhatsAppMessage(recommendation);
            window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Request This Tool
        </Button>
      </CardContent>
    </Card>
  );

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          {message.type === 'recommendations' && message.data ? (
            <div>
              <p className="mb-4">{message.content}</p>
              <div className="space-y-3">
                {message.data.map((rec: ToolRecommendation, index: number) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startNewConversation}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get New Recommendations
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-muted">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );

  if (variant === 'embedded') {
    return (
      <div className={`w-full ${className}`}>
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-brand-teal flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Tool Recommender</CardTitle>
                  <p className="text-sm text-muted-foreground">Find your perfect tool</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={startNewConversation}>
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 mb-4"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-2xl h-[80vh] sm:h-[600px] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-brand-teal flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Tool Recommender</h3>
                    <p className="text-sm text-muted-foreground">Find your perfect tool</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={startNewConversation}>
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <AnimatePresence>
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-brand-teal flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Welcome to AI Tool Recommender!</h4>
                      <p className="text-muted-foreground mb-4">
                        I'll help you find the perfect premium tool based on your needs and budget.
                      </p>
                      <Button onClick={startNewConversation} className="mx-auto">
                        <Target className="w-4 h-4 mr-2" />
                        Start Recommendation
                      </Button>
                    </motion.div>
                  )}
                  
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 mb-4"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIRecommendationBot;
