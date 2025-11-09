import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  ArrowLeft,
  DollarSign,
  Filter,
  Sparkles,
  HelpCircle,
  CreditCard,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  type: 'text' | 'categories' | 'price_range' | 'products' | 'faq' | 'bank_info' | 'contact_info' | 'tool_search' | 'tool_details';
  data?: any;
  timestamp: Date;
}

interface ChatState {
  step: 'welcome' | 'category_selection' | 'price_range' | 'products_display' | 'faq' | 'help' | 'tool_search';
  selectedCategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  filteredProducts?: any[];
  showFaqs?: boolean;
  searchResults?: any[];
}

const categories = [
  { name: 'AI', icon: '🤖', description: 'AI tools' },
  { name: 'AI & ML', icon: '🤖', description: 'AI & Machine Learning' },
  { name: 'Design', icon: '🎨', description: 'Design tools' },
  { name: 'Video', icon: '🎬', description: 'Video editing' },
  { name: 'Writing', icon: '✍️', description: 'Writing tools' },
  { name: 'SEO', icon: '🔍', description: 'SEO tools' },
  { name: 'Marketing', icon: '📈', description: 'SEO & Marketing' },
  { name: 'Web Dev', icon: '💻', description: 'Web development' },
  { name: 'Productivity', icon: '⚡', description: 'Productivity tools' },
  { name: 'Creative', icon: '🎭', description: 'Creative tools' }
];

const priceRanges = [
  { label: 'Under Rs1,400', min: 0, max: 1400 },
  { label: 'Rs1,400 - Rs2,800', min: 1400, max: 2800 },
  { label: 'Rs2,800 - Rs5,600', min: 2800, max: 5600 },
  { label: 'Rs5,600 - Rs14,000', min: 5600, max: 14000 },
  { label: 'Above Rs14,000', min: 14000, max: 280000 }
];

const faqData = [
  {
    id: 'payment',
    category: 'Payment & Billing',
    icon: '💳',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and mobile payments. All transactions are secure and encrypted.'
      },
      {
        question: 'How do I get a refund?',
        answer: 'You can request a refund within 30 days of purchase. Contact our support team with your order number and reason for refund. We process refunds within 3-5 business days.'
      },
      {
        question: 'Do you offer payment plans?',
        answer: 'Yes! We offer flexible payment plans for tools over Rs5,000. You can split payments into 2-3 installments. Contact us for more details.'
      }
    ]
  },
  {
    id: 'bank',
    category: 'Payment Information',
    icon: '🏦',
    questions: [
      {
        question: 'What are your payment details?',
        answer: 'We accept EasyPaisa payments. Send payment to +234 814 198 8239 and share the transaction receipt via WhatsApp for instant confirmation.'
      },
      {
        question: 'How long do EasyPaisa payments take?',
        answer: 'EasyPaisa payments are processed instantly. You\'ll receive confirmation within minutes after sharing the transaction receipt.'
      },
      {
        question: 'Is EasyPaisa payment safe?',
        answer: 'Yes, EasyPaisa payments are completely safe and secure. We verify all transactions and provide instant confirmation.'
      }
    ]
  },
  {
    id: 'delivery',
    category: 'Delivery & Access',
    icon: '📦',
    questions: [
      {
        question: 'How do I get access to my tools?',
        answer: 'After payment confirmation, you\'ll receive login credentials and access links via email within 24 hours. Check your spam folder if you don\'t see it.'
      },
      {
        question: 'What if I don\'t receive my tools?',
        answer: 'If you don\'t receive access within 24 hours, contact our support team immediately. We\'ll resolve the issue and provide alternative access methods.'
      },
      {
        question: 'Do you provide installation help?',
        answer: 'Yes! We provide step-by-step installation guides and offer free setup assistance for all premium tools. Contact us for personalized help.'
      }
    ]
  },
  {
    id: 'support',
    category: 'Support & Contact',
    icon: '🆘',
    questions: [
      {
        question: 'How can I contact support?',
        answer: 'You can reach us via WhatsApp (+234 814 198 8239), email (support@toolsy.com), or through our live chat. We respond within 2 hours during business hours.'
      },
      {
        question: 'What are your business hours?',
        answer: 'Our support team is available Monday to Friday, 9 AM to 6 PM (PKT). For urgent issues, WhatsApp support is available 24/7.'
      },
      {
        question: 'Do you offer technical support?',
        answer: 'Yes! We provide comprehensive technical support for all tools, including troubleshooting, configuration help, and usage guidance.'
      }
    ]
  }
];

const bankAccountInfo = {
  title: 'Payment Information',
  accounts: [
    {
      bank: 'EasyPaisa',
      accountTitle: 'Rameen Shahzad',
      accountNumber: '+234 814 198 8239',
      iban: 'N/A',
      branch: 'Mobile Payment'
    }
  ],
  note: 'For EasyPaisa payments, please send payment to the number above and share the transaction receipt via WhatsApp.'
};

const contactInfo = {
  title: 'Contact Information',
  details: [
    { icon: '📱', label: 'WhatsApp', value: '+234 814 198 8239', link: 'https://wa.me/2348141988239' },
    { icon: '📧', label: 'Email', value: 'support@toolsy.com', link: 'mailto:support@toolsy.com' },
    { icon: '🕒', label: 'Business Hours', value: 'Mon-Fri: 9 AM - 6 PM (PKT)' },
    { icon: '📍', label: 'Location', value: 'Lahore, Pakistan' }
  ]
};

export const ToolChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatState>({ step: 'welcome' });
  const [inputValue, setInputValue] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const { formatCurrency } = useCurrencyConverter();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('bot', 'Hi! I\'m your DAILYTECH TOOLS SOLUTIONS assistant. I can help you find tools by name or category, answer questions, and provide support. What would you like to do?', 'text');
      setTimeout(() => {
        addMessage('bot', 'Choose an option below or type a tool name to search:', 'text', {
          options: [
            { label: '🔍 Find Tools', action: 'find_tools', description: 'Browse tools by category' },
            { label: '🔎 Search Tools', action: 'search_tools', description: 'Search tools by name' },
            { label: '❓ FAQs', action: 'faqs', description: 'Common questions & answers' },
            { label: '🏦 Bank Info', action: 'bank_info', description: 'Payment & account details' },
            { label: '📞 Contact', action: 'contact', description: 'Get in touch with us' }
          ]
        });
      }, 1000);
    }
  }, []);

  const addMessage = (role: 'user' | 'bot', content: string, type: Message['type'] = 'text', data?: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      type,
      data,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleCategorySelect = (category: string) => {
    addMessage('user', `I'm interested in ${category} tools`, 'text');
    setChatState(prev => ({ ...prev, selectedCategory: category, step: 'price_range' }));
    
    setTimeout(() => {
      addMessage('bot', `Great choice! ${category} tools are amazing. What's your budget range?`, 'price_range', priceRanges);
    }, 500);
  };

  const handlePriceRangeSelect = (range: { min: number; max: number; label: string }) => {
    addMessage('user', `My budget is ${range.label}`, 'text');
    setChatState(prev => ({ ...prev, priceRange: range, step: 'products_display' }));
    
    // Filter products based on category and price range
    console.log('Chatbot filtering products:', {
      selectedCategory: chatState.selectedCategory,
      priceRange: range,
      totalProducts: products.length,
      products: products.map(p => ({ name: p.name, category: p.category, price: p.price }))
    });
    
    const filteredProducts = products.filter(product => {
      // More flexible category matching - check if the selected category is contained in the product category
      const categoryMatch = product.category === chatState.selectedCategory || 
                           product.category.toLowerCase().includes(chatState.selectedCategory.toLowerCase()) ||
                           chatState.selectedCategory.toLowerCase().includes(product.category.toLowerCase());
      
      // Check if any pricing plan falls within the user's budget range
      let priceMatch = false;
      if ((product as any).pricing_plans && (product as any).pricing_plans.length > 0) {
        const enabledPlans = (product as any).pricing_plans.filter((plan: any) => plan.is_enabled);
        
        priceMatch = enabledPlans.some((plan: any) => {
          // Check monthly price
          if (plan.monthly_price) {
            const monthlyPrice = parseFloat(plan.monthly_price.replace(/[^\d.]/g, ''));
            if (!isNaN(monthlyPrice) && monthlyPrice >= range.min && monthlyPrice <= range.max) {
              return true;
            }
          }
          
          // Check yearly price
          if (plan.yearly_price) {
            const yearlyPrice = parseFloat(plan.yearly_price.replace(/[^\d.]/g, ''));
            if (!isNaN(yearlyPrice) && yearlyPrice >= range.min && yearlyPrice <= range.max) {
              return true;
            }
          }
          
          return false;
        });
      }
      
      console.log(`Product: ${product.name}, Category: ${product.category}, CategoryMatch: ${categoryMatch}, PriceMatch: ${priceMatch}`);
      
      return categoryMatch && priceMatch;
    });
    
    console.log('Filtered products result:', filteredProducts.length, filteredProducts.map(p => p.name));

    setChatState(prev => ({ ...prev, filteredProducts }));

    setTimeout(() => {
      if (filteredProducts.length > 0) {
        addMessage('bot', `Perfect! I found ${filteredProducts.length} ${chatState.selectedCategory} tools in your price range. Here are the best options:`, 'products', filteredProducts);
      } else {
        addMessage('bot', `Sorry, no ${chatState.selectedCategory} tools are available in your price range. Please try a different budget range or category.`, 'text');
      }
    }, 500);
  };

  const handleReset = () => {
    setMessages([]);
    setChatState({ step: 'welcome' });
    setInputValue('');
    setTimeout(() => {
      addMessage('bot', 'Hi! I\'m your DAILYTECH TOOLS SOLUTIONS assistant. I can help you find tools by name or category, answer questions, and provide support. What would you like to do?', 'text');
      setTimeout(() => {
        addMessage('bot', 'Choose an option below or type a tool name to search:', 'text', {
          options: [
            { label: '🔍 Find Tools', action: 'find_tools', description: 'Browse tools by category' },
            { label: '🔎 Search Tools', action: 'search_tools', description: 'Search tools by name' },
            { label: '❓ FAQs', action: 'faqs', description: 'Common questions & answers' },
            { label: '🏦 Bank Info', action: 'bank_info', description: 'Payment & account details' },
            { label: '📞 Contact', action: 'contact', description: 'Get in touch with us' }
          ]
        });
      }, 1000);
    }, 100);
  };

  const handleOptionSelect = (action: string) => {
    switch (action) {
      case 'find_tools':
        addMessage('user', 'I want to find tools', 'text');
        setChatState(prev => ({ ...prev, step: 'category_selection' }));
        setTimeout(() => {
          addMessage('bot', 'Great! What category of tools are you interested in?', 'categories', categories);
        }, 500);
        break;
      case 'search_tools':
        addMessage('user', 'I want to search for tools', 'text');
        setChatState(prev => ({ ...prev, step: 'tool_search' }));
        setTimeout(() => {
          addMessage('bot', 'Type the name of a tool you\'re looking for, or try keywords like "AI", "design", "video editing", etc. I\'ll search through our collection and show you matching tools!', 'text');
        }, 500);
        break;
      case 'faqs':
        addMessage('user', 'Show me FAQs', 'text');
        setChatState(prev => ({ ...prev, step: 'faq' }));
        setTimeout(() => {
          addMessage('bot', 'Here are the most frequently asked questions:', 'faq', faqData);
        }, 500);
        break;
      case 'bank_info':
        addMessage('user', 'Show me bank account information', 'text');
        setTimeout(() => {
          addMessage('bot', 'Here are our bank account details for payments:', 'bank_info', bankAccountInfo);
        }, 500);
        break;
      case 'contact':
        addMessage('user', 'Show me contact information', 'text');
        setTimeout(() => {
          addMessage('bot', 'Here\'s how you can reach us:', 'contact_info', contactInfo);
        }, 500);
        break;
    }
  };

  const handleFaqQuestion = (question: string, answer: string) => {
    addMessage('user', question, 'text');
    setTimeout(() => {
      addMessage('bot', answer, 'text');
    }, 500);
  };

  const getPricingPlans = (product: any) => {
    if (!product.pricing_plans || product.pricing_plans.length === 0) {
      return 'No pricing available';
    }

    const enabledPlans = product.pricing_plans.filter((plan: any) => plan.is_enabled);
    if (enabledPlans.length === 0) {
      return 'No active plans';
    }

    // Show pricing plans instead of calculated price
    const planTypes = enabledPlans.map((plan: any) => {
      const planName = plan.plan_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Plan';
      const monthlyPrice = plan.monthly_price ? `Monthly: ${plan.monthly_price}` : '';
      const yearlyPrice = plan.yearly_price ? `Yearly: ${plan.yearly_price}` : '';
      const prices = [monthlyPrice, yearlyPrice].filter(Boolean).join(' | ');
      return `${planName}: ${prices}`;
    });

    return planTypes.join('\n');
  };

  const searchToolsByName = async (searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    try {
      // Search in product names, descriptions, and categories using local products
      const searchResults = products.filter((product: any) => {
        const nameMatch = product.name?.toLowerCase().includes(lowerSearchTerm);
        const descMatch = product.description?.toLowerCase().includes(lowerSearchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(lowerSearchTerm);
        const slugMatch = product.slug?.toLowerCase().includes(lowerSearchTerm);
        
        return nameMatch || descMatch || categoryMatch || slugMatch;
      });

      // Fetch pricing plans for the search results
      if (searchResults.length > 0) {
        const productIds = searchResults.map((p: any) => p.id);
        const plansResponse = await supabase
          .from('pricing_plans')
          .select('*')
          .in('product_id', productIds);

        if (!plansResponse.error && plansResponse.data) {
          // Attach pricing plans to products
          searchResults.forEach((product: any) => {
            product.pricing_plans = plansResponse.data.filter((plan: any) => plan.product_id === product.id);
          });
        }
      }

      return searchResults;
    } catch (error) {
      console.error('Error searching tools:', error);
      // Fallback to local products without pricing plans
      return products.filter((product: any) => {
        const nameMatch = product.name?.toLowerCase().includes(lowerSearchTerm);
        const descMatch = product.description?.toLowerCase().includes(lowerSearchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(lowerSearchTerm);
        const slugMatch = product.slug?.toLowerCase().includes(lowerSearchTerm);
        
        return nameMatch || descMatch || categoryMatch || slugMatch;
      });
    }
  };

  const handleToolSearch = async (searchTerm: string) => {
    try {
      const results = await searchToolsByName(searchTerm);
      
      if (results.length === 0) {
        addMessage('bot', `Sorry, I couldn't find any tools matching "${searchTerm}". Try searching with different keywords or browse by category.`, 'text');
        setTimeout(() => {
          addMessage('bot', 'Here are some popular tool categories you might be interested in:', 'categories', categories);
        }, 1000);
      } else if (results.length === 1) {
        // Show detailed view for single result
        addMessage('bot', `Found 1 tool matching "${searchTerm}":`, 'tool_details', results[0]);
      } else {
        // Show search results for multiple matches
        addMessage('bot', `Found ${results.length} tools matching "${searchTerm}":`, 'tool_search', results);
      }
    } catch (error) {
      console.error('Error in handleToolSearch:', error);
      addMessage('bot', `Sorry, I encountered an error while searching for "${searchTerm}". Please try again.`, 'text');
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addMessage('user', inputValue, 'text');
    const userInput = inputValue.toLowerCase();
    const originalInput = inputValue.trim();
    setInputValue('');
    
    // Enhanced keyword-based responses with tool search
    setTimeout(() => {
      if (userInput.includes('reset') || userInput.includes('start over')) {
        handleReset();
      } else if (userInput.includes('help')) {
        addMessage('bot', 'I can help you with:\n• Finding tools by name or category\n• Answering FAQs\n• Providing bank account info\n• Contact information\n\nTry typing a tool name to search for it!', 'text');
      } else if (userInput.includes('bank') || userInput.includes('account') || userInput.includes('payment')) {
        addMessage('bot', 'Here are our bank account details:', 'bank_info', bankAccountInfo);
      } else if (userInput.includes('contact') || userInput.includes('support') || userInput.includes('phone') || userInput.includes('email')) {
        addMessage('bot', 'Here\'s how you can reach us:', 'contact_info', contactInfo);
      } else if (userInput.includes('faq') || userInput.includes('question')) {
        addMessage('bot', 'Here are the most frequently asked questions:', 'faq', faqData);
      } else if (userInput.includes('tool') || userInput.includes('find') || userInput.includes('category')) {
        setChatState(prev => ({ ...prev, step: 'category_selection' }));
        addMessage('bot', 'Great! What category of tools are you interested in?', 'categories', categories);
      } else {
        // Check if this might be a tool search
        handleToolSearch(originalInput);
      }
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'categories':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.data.map((category: any) => (
                <Button
                  key={category.name}
                  variant="outline"
                  className="h-auto p-3 flex items-start justify-start text-left hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 min-h-[60px]"
                  onClick={() => handleCategorySelect(category.name)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className="text-lg flex-shrink-0 mt-0.5">{category.icon}</span>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium text-sm mb-1 break-words leading-tight">{category.name}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed break-words">{category.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3">
            {message.data.map((faqCategory: any) => (
              <Card key={faqCategory.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">{faqCategory.icon}</span>
                    {faqCategory.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {faqCategory.questions.map((faq: any, index: number) => (
                      <div key={index} className="border rounded-lg">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto text-left"
                          onClick={() => setExpandedFaq(expandedFaq === `${faqCategory.id}-${index}` ? null : `${faqCategory.id}-${index}`)}
                        >
                          <span className="text-sm font-medium">{faq.question}</span>
                          {expandedFaq === `${faqCategory.id}-${index}` ? (
                            <ChevronUp className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          )}
                        </Button>
                        {expandedFaq === `${faqCategory.id}-${index}` && (
                          <div className="px-3 pb-3 text-sm text-muted-foreground">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case 'bank_info':
        return (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {message.data.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {message.data.accounts.map((account: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">{account.bank}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="font-medium">Account Title:</span> {account.accountTitle}</div>
                      <div><span className="font-medium">Account Number:</span> {account.accountNumber}</div>
                      <div><span className="font-medium">IBAN:</span> {account.iban}</div>
                      <div><span className="font-medium">Branch:</span> {account.branch}</div>
                    </div>
                  </div>
                ))}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">{message.data.note}</p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case 'contact_info':
        return (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {message.data.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {message.data.details.map((detail: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                    <span className="text-lg">{detail.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{detail.label}</div>
                      {detail.link ? (
                        <a 
                          href={detail.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <div className="text-xs text-muted-foreground">{detail.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case 'tool_search':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {message.data.slice(0, 5).map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50">
                  <div className="flex">
                    <div className="w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center flex-shrink-0 border-r border-border/50">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xl">🛠️</div>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-sm font-bold text-primary">
                          {getPricingPlans(product)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/product/${product.slug}`} className="flex-1">
                          <Button size="sm" className="w-full text-xs py-1">
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs py-1 px-2"
                          onClick={() => handleToolSearch(product.name)}
                        >
                          More Info
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
            {message.data.length > 5 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing 5 of {message.data.length} results
                </p>
                <Link to="/tools">
                  <Button variant="outline" size="sm">
                    View All Tools
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case 'tool_details':
        const tool = message.data;
        return (
          <div className="space-y-3">
            <Card className="overflow-hidden border border-border/50">
              <div className="flex">
                <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center flex-shrink-0 border-r border-border/50">
                  {tool.main_image_url ? (
                    <img
                      src={tool.main_image_url}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl">🛠️</div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {tool.category}
                    </Badge>
                    <span className="text-sm font-bold text-primary">
                      {getPricingPlans(tool)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex gap-2">
                    <Link to={`/product/${tool.slug}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs py-2">
                        View Full Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-xs py-2 px-3"
                      onClick={() => {
                        addMessage('user', `Tell me more about ${tool.name}`, 'text');
                        setTimeout(() => {
                          addMessage('bot', `Here's more information about ${tool.name}:\n\n${tool.description}\n\nCategory: ${tool.category}\nPrice: ${getPricingPlans(tool)}\n\nWould you like to know about similar tools or have any other questions?`, 'text');
                        }, 500);
                      }}
                    >
                      More Info
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case 'price_range':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.data.map((range: any) => (
                <Button
                  key={range.label}
                  variant="outline"
                  className="h-auto p-2 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 text-sm"
                  onClick={() => handlePriceRangeSelect(range)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {message.data.slice(0, 3).map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50">
                  <div className="flex">
                    <div className="w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center flex-shrink-0 border-r border-border/50">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xl">🛠️</div>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-sm font-bold text-primary">
                          {getPricingPlans(product)}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <Link to={`/product/${product.slug}`}>
                        <Button size="sm" className="w-full text-xs py-1">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
            {message.data.length > 3 && (
              <div className="text-center">
                <Link to="/tools">
                  <Button variant="outline" size="sm">
                    View All {chatState.selectedCategory} Tools
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        );

      default:
        // Check if this is a message with options data
        if (message.data && message.data.options) {
          return (
            <div className="space-y-2">
              <p className="text-sm mb-3">{message.content}</p>
              <div className="grid grid-cols-1 gap-2">
                {message.data.options.map((option: any) => (
                  <Button
                    key={option.action}
                    variant="outline"
                    className="h-auto p-3 flex items-start justify-start text-left hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                    onClick={() => handleOptionSelect(option.action)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="text-lg flex-shrink-0 mt-0.5">{option.label.split(' ')[0]}</span>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-medium text-sm mb-1 break-words leading-tight">
                          {option.label.replace(/^[^\s]+\s/, '')}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed break-words">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          );
        }
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)]"
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            data-chat-button
            className="rounded-full w-14 h-14 bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-[480px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-brand-teal rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">DAILYTECH TOOLS SOLUTIONS Assistant</h3>
                  <p className="text-xs text-muted-foreground">Find tools, get help & support</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } rounded-lg p-3`}
                    >
                      {renderMessage(message)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a tool name, ask questions, or get help..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOptionSelect('faqs')} className="text-xs">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  FAQs
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
