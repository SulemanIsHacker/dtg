
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Users, Zap, MessageCircle, CheckCircle, Clock, AlertTriangle, X, ArrowRight, Play, Sparkles, TrendingUp, Award, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Optimized video preloading with intersection observer
    const preloadVideo = () => {
      // Only preload if user is likely to interact with the video
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/plxdBDphi8o?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            iframe.onload = () => {
              setVideoLoaded(true);
              document.body.removeChild(iframe);
            };
            
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      // Observe the video container
      const videoContainer = document.querySelector('[data-video-container]');
      if (videoContainer) {
        observer.observe(videoContainer);
      } else {
        // Fallback: preload after a delay
        setTimeout(() => {
          setVideoLoaded(true);
        }, 2000);
      }
    };

    // Delay preloading to prioritize critical resources
    const timeoutId = setTimeout(preloadVideo, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleWhatsAppContact = () => {
    const message = "Hi! I'm interested in your premium AI/SEO tools at discounted prices. Can you tell me more?";
    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-card/30 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-primary/20"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-brand-teal/20"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-6 h-6" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-brand-purple/20"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-7 h-7" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-primary/20"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <TrendingUp className="w-6 h-6" />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 py-8 min-h-screen">
        
        {/* Text Content */}
        <motion.div 
          className="text-center space-y-8 max-w-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-full mb-6 backdrop-blur-sm shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-yellow-400 mr-3" />
            <span className="text-yellow-400 font-semibold text-base">100% Genuine Tools • No Scams</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-white drop-shadow-2xl">
              Premium AI & SEO Tools
            </span>
            <br />
            <span className="text-yellow-400 drop-shadow-xl">
              Without the Premium Price
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Stop paying full price for expensive subscriptions! Get{" "}
            <span className="text-yellow-400 font-bold">
              ChatGPT Plus
            </span>
            ,{" "}
            <span className="text-yellow-400 font-bold">
              SEMRush
            </span>
            ,{" "}
            <span className="text-yellow-400 font-bold">
              Adobe Creative Cloud
            </span>
            {" "}and 30+ premium tools for up to{" "}
            <span className="text-yellow-400 font-bold">
              75% less
            </span>
            .{" "}
            <span className="text-yellow-400 font-bold">
              Verified accounts
            </span>
            ,{" "}
            <span className="text-yellow-400 font-bold">
              instant access
            </span>
            , and{" "}
            <span className="text-yellow-400 font-bold">
              24/7 support
            </span>
            {" "}- all backed by our money-back guarantee.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">Verified Quality</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Global Support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Lock className="w-4 h-4 text-orange-400" />
              <span className="font-medium">Secure Access</span>
            </div>
          </motion.div>


        </motion.div>

        {/* YouTube Video - Desktop only */}
        <motion.div 
          className="hidden lg:block w-full max-w-4xl mt-16"
          data-video-container
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-border/50">
            {!videoLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading video...</p>
                </div>
              </div>
            ) : null}
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/plxdBDphi8o?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0"
              title="DAILYTECH TOOLS SOLUTIONS Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setVideoLoaded(true)}
            />
          </div>
        </motion.div>

        {/* CTA Buttons - After Video */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Button 
            variant="hero"
            size="lg" 
            className="text-lg px-8 py-4 font-bold"
            onClick={handleWhatsAppContact}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Started Now
          </Button>
          <Button 
            variant="gradient" 
            size="lg" 
            className="text-lg px-8 py-4"
            asChild
          >
            <Link to="/tools">
              <ArrowRight className="w-5 h-5 mr-2" />
              Browse Tools
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
