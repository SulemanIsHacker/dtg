import { useEffect } from 'react';

interface SchemaMarkupProps {
  type?: 'homepage' | 'product' | 'tools';
  productData?: any;
  products?: any[];
}

export const SchemaMarkup = ({ type = 'homepage', productData, products = [] }: SchemaMarkupProps) => {
  useEffect(() => {
    // Remove existing schema markup
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const schemas = [];

    if (type === 'homepage') {
      // Organization Schema
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "DAILYTECH TOOLS SOLUTIONS",
        "description": "DAILYTECH TOOLS SOLUTIONS - Premium AI and SEO tools at affordable shared prices. Genuine subscriptions from official sources.",
        "url": "https://toolsy.store",
        "logo": "https://toolsy.store/dtg.jpeg",
        "foundingDate": "2024",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+234 814 198 8239",
          "contactType": "customer service",
          "availableLanguage": "English"
        },
        "sameAs": [
          "https://wa.me/2348141988239"
        ],
        "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG"
        }
      };

      // WebSite Schema
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "DAILYTECH TOOLS SOLUTIONS",
        "url": "https://toolsy.store",
        "description": "DAILYTECH TOOLS SOLUTIONS - Get access to premium AI tools, SEO software, design tools, and more at affordable shared prices. Genuine subscriptions from official sources.",
        "publisher": {
          "@type": "Organization",
          "name": "DAILYTECH TOOLS SOLUTIONS"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://toolsy.store/tools?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      };

      // FAQ Schema
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Are these tools genuine and legal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all tools are 100% genuine and purchased directly from official sources. We share premium subscriptions legally with verified users."
            }
          },
          {
            "@type": "Question",
            "name": "How does shared access work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We purchase premium subscriptions and share access with 2-5 verified users. Each user gets full access to all premium features."
            }
          },
          {
            "@type": "Question",
            "name": "How quickly will I get access?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You'll receive your login credentials within minutes of payment confirmation via WhatsApp."
            }
          },
          {
            "@type": "Question",
            "name": "What if I have issues with the tool?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We provide 24/7 support via WhatsApp. If there are any issues, we'll resolve them immediately or provide a refund."
            }
          },
          {
            "@type": "Question",
            "name": "Do you offer refunds?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we offer a money-back guarantee. If you're not satisfied with the service, we'll provide a full refund."
            }
          }
        ]
      };

      // Simple ItemList for featured tools
      const featuredToolsSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Featured Premium Tools",
        "description": "Our most popular premium tools at affordable shared prices",
        "itemListElement": products?.slice(0, 10).map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://toolsy.store/product/${product.slug}`,
          "name": product.name
        })) || []
      };

      // Breadcrumb Schema
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://toolsy.store"
          }
        ]
      };

      schemas.push(organizationSchema, websiteSchema, faqSchema, featuredToolsSchema, breadcrumbSchema);
    }

    if (type === 'product' && productData) {
      // Get pricing information from productData
      const getLowestPrice = () => {
        if (productData.pricing_plans && productData.pricing_plans.length > 0) {
          const enabledPlans = productData.pricing_plans.filter(plan => plan.is_enabled);
          if (enabledPlans.length > 0) {
            const prices = [];
            enabledPlans.forEach(plan => {
              if (plan.monthly_price && !isNaN(Number(plan.monthly_price))) {
                prices.push(Number(plan.monthly_price));
              }
              if (plan.yearly_price && !isNaN(Number(plan.yearly_price))) {
                prices.push(Number(plan.yearly_price));
              }
            });
            return prices.length > 0 ? Math.min(...prices).toString() : productData.price;
          }
        }
        return productData.price || "0";
      };

      // Product Schema with reviews
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productData.name,
        "image": productData.main_image_url ? [productData.main_image_url] : [],
        "description": productData.detailed_description || productData.description,
        "sku": productData.id,
        "brand": {
          "@type": "Brand",
          "name": "DAILYTECH TOOLS SOLUTIONS"
        },
        "category": productData.category,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": productData.rating || 4.5,
          "reviewCount": productData.review_count || 150,
          "bestRating": 5,
          "worstRating": 1
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 5,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "Ahmed K."
            },
            "reviewBody": `Excellent service! ${productData.name} works perfectly with shared access. Saved me hundreds of dollars compared to individual subscription.`,
            "datePublished": "2024-01-15"
          },
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 5,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "Sarah M."
            },
            "reviewBody": `Amazing value for money! The shared access to ${productData.name} is working flawlessly. Customer support is very responsive.`,
            "datePublished": "2024-01-10"
          },
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 4,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "David L."
            },
            "reviewBody": `Great tool at an affordable price. ${productData.name} has all the features I need for my work. Highly recommended!`,
            "datePublished": "2024-01-05"
          }
        ],
        "offers": {
          "@type": "Offer",
          "priceCurrency": "NGN",
          "price": getLowestPrice(),
          "availability": "https://schema.org/InStock",
          "url": `https://toolsy.store/product/${productData.slug}`,
          "seller": {
            "@type": "Organization",
            "name": "DAILYTECH TOOLS SOLUTIONS"
          },
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "itemCondition": "https://schema.org/NewCondition"
        }
      };

      // Product-specific FAQ Schema
      const productFaqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How does shared access work for ${productData.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `We purchase a premium ${productData.name} subscription and share access with 2-5 verified users. Each user gets full access to all premium features and can use the tool simultaneously.`
            }
          },
          {
            "@type": "Question",
            "name": `What's included in the ${productData.name} subscription?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `You get full access to all premium features of ${productData.name}, including advanced tools, templates, and priority support. The exact features depend on the plan you choose.`
            }
          },
          {
            "@type": "Question",
            "name": "Is this a genuine subscription?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all our subscriptions are 100% genuine and purchased directly from the official source. We never use cracked or pirated software."
            }
          }
        ]
      };

      // Add breadcrumb for product page
      const productBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://toolsy.store"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://toolsy.store/tools"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": productData.name,
            "item": `https://toolsy.store/product/${productData.slug}`
          }
        ]
      };

      schemas.push(productSchema, productFaqSchema, productBreadcrumb);
    }

    if (type === 'tools') {
      // Tools/Category Listing Schema
      const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Premium Tools List",
        "description": "Complete collection of premium AI, SEO, and design tools at affordable shared prices",
        "itemListElement": products?.map((product, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `https://toolsy.store/product/${product.slug}`,
          "name": product.name
        })) || []
      };

      // Add breadcrumb for tools page
      const toolsBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://toolsy.store"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://toolsy.store/tools"
          }
        ]
      };

      schemas.push(itemListSchema, toolsBreadcrumb);
    }

    // Add schemas to document head
    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [type, productData, products]);

  return null; // This component doesn't render anything visible
};
