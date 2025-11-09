import { Shield, CheckCircle, Clock, MessageCircle, X, AlertTriangle, Star, Users, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollAnimation, FadeIn, SlideUp, StaggeredAnimation } from "./ScrollAnimation";

export const TrustSection = () => {
  return (
    <section className="py-20 md:py-24 px-6 md:px-8 bg-gradient-to-br from-background via-card/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Heading */}
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Trust & Security
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Choose Us Over{" "}
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Scammers?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The market is full of fraudsters selling fake tools. Here's why we're different and{" "}
            <span className="text-yellow-500 font-semibold">trustworthy</span>.
          </p>
        </FadeIn>

        {/* Feature Cards */}
        <StaggeredAnimation 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          staggerDelay={0.1}
          direction="up"
          distance={30}
        >
          <div className="bg-card rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Genuine Tools</h3>
            <p className="text-muted-foreground">
              All subscriptions are purchased directly from official websites. No cracked or pirated software.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quality Guaranteed</h3>
            <p className="text-muted-foreground">
              We ensure all tools work properly throughout the subscription period. Comprehensive support if issues arise.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Long-term Access</h3>
            <p className="text-muted-foreground">
              Unlike scammers who disappear, we provide consistent access and support throughout your subscription.
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border/50 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
            <p className="text-muted-foreground">
              Direct WhatsApp support for any issues. Real person, real solutions, real fast response times.
            </p>
          </div>
        </StaggeredAnimation>

        {/* Scammer Tactics Section */}
        <SlideUp 
          className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-2xl p-8 relative overflow-hidden"
          distance={40}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3 bg-red-500/20 px-4 py-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold text-white">
                  Common Scammer Tactics We DON'T Use:
                </h3>
              </div>
            </div>
            
            <StaggeredAnimation 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              staggerDelay={0.1}
              direction="up"
              distance={20}
            >
              <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white font-medium">Selling tools that stop working after days</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white font-medium">Fake screenshots and testimonials</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white font-medium">No support after payment</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-white font-medium">Asking for advance payment without proof</span>
              </div>
            </StaggeredAnimation>
          </div>
        </SlideUp>
      </div>
    </section>
  );
};