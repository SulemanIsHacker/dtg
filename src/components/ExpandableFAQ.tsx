import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
}

interface ExpandableFAQProps {
  title?: string;
  faqs: FAQItem[];
}

export const ExpandableFAQ: React.FC<ExpandableFAQProps> = ({ 
  title = "Frequently Asked Questions", 
  faqs 
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            
            return (
              <div 
                key={index} 
                className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/50"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h4 className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </h4>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
