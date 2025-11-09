import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Star, TrendingUp } from 'lucide-react';

interface ToolsLoadingAnimationProps {
  progress: number;
  step?: string;
  text?: string;
}

export const ToolsLoadingAnimation: React.FC<ToolsLoadingAnimationProps> = ({
  progress,
  step,
  text = "Loading Premium Tools..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-brand-teal/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Floating icons */}
      <div className="relative z-10">
        <motion.div
          className="absolute -top-8 -left-8 text-primary/30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <motion.div
          className="absolute -top-8 -right-8 text-brand-teal/30"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <Zap className="w-5 h-5" />
        </motion.div>
        <motion.div
          className="absolute -bottom-8 -left-8 text-brand-purple/30"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Star className="w-7 h-7" />
        </motion.div>
        <motion.div
          className="absolute -bottom-8 -right-8 text-orange-400/30"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <TrendingUp className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Main loading animation */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Multi-layered spinner */}
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 border-3 border-brand-teal/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-4 border-2 border-primary/40 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-r from-primary to-brand-teal rounded-full transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Orbiting dots */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0'
              }}
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.1
              }}
              initial={{
                x: -1,
                y: -1,
                rotate: i * 60
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Loading text */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h3
          className="text-2xl font-bold bg-gradient-to-r from-primary via-brand-teal to-primary bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {text}
        </motion.h3>
        
        <motion.p
          className="text-muted-foreground text-lg"
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Getting the latest premium tools for you
        </motion.p>
      </motion.div>

      {/* Enhanced progress bar */}
      <motion.div
        className="w-80 bg-muted/30 rounded-full h-4 overflow-hidden border border-border/20 relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.div
          className="bg-gradient-to-r from-primary via-brand-teal to-primary h-full rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/50 to-brand-teal/50 rounded-full blur-sm"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Progress percentage */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-sm font-bold text-primary bg-background/80 px-2 py-1 rounded-full">
            {Math.round(progress)}%
          </span>
        </motion.div>
      </motion.div>

      {/* Step indicator */}
      {step && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.p
            className="text-primary font-medium text-base"
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {step}
          </motion.p>
        </motion.div>
      )}

      {/* Loading dots */}
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
