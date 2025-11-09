import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'wave' | 'minimal' | 'orbit' | 'ripple' | 'bounce' | 'glow' | 'particles';
  text?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Minimal CSS-only spinner (lightweight)
  const MinimalSpinner = () => (
    <div className={`${sizeClasses[size]} border-2 border-muted border-t-primary rounded-full animate-spin`} />
  );

  // Dots animation (lightweight)
  const DotsSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Pulse animation (lightweight)
  const PulseSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} bg-primary rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Wave animation (lightweight)
  const WaveSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: ['8px', '20px', '8px']
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Orbit animation (attractive)
  const OrbitSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <motion.div
        className="absolute inset-0 border-2 border-primary/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 border-2 border-brand-teal/30 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-2 left-1/2 w-2 h-2 bg-brand-teal rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  // Ripple animation (catchy)
  const RippleSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-primary rounded-full"
          animate={{
            scale: [0.5, 1.2, 0.5],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );

  // Bounce animation (fun)
  const BounceSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gradient-to-r from-primary to-brand-teal rounded-full"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Glow animation (attractive)
  const GlowSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary via-brand-teal to-primary rounded-full blur-sm"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-2 bg-primary rounded-full"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-4 bg-background rounded-full"
        animate={{
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );

  // Particles animation (catchy)
  const ParticlesSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: '0 0'
          }}
          animate={{
            rotate: [0, 360],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut"
          }}
          initial={{
            x: -0.5,
            y: -0.5,
            rotate: i * 45
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-2 h-2 bg-primary rounded-full" />
      </motion.div>
    </div>
  );

  // Default spinner with motion
  const DefaultSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-muted border-t-primary rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      case 'wave':
        return <WaveSpinner />;
      case 'minimal':
        return <MinimalSpinner />;
      case 'orbit':
        return <OrbitSpinner />;
      case 'ripple':
        return <RippleSpinner />;
      case 'bounce':
        return <BounceSpinner />;
      case 'glow':
        return <GlowSpinner />;
      case 'particles':
        return <ParticlesSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-brand-teal/5 to-primary/5 rounded-2xl blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main spinner with enhanced container */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {renderSpinner()}
      </motion.div>
      
      {text && (
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.p
            className={`text-muted-foreground ${textSizeClasses[size]} font-medium`}
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.p>
        </motion.div>
      )}
      
      {showProgress && (
        <motion.div
          className="relative z-10 w-40 bg-muted/50 rounded-full h-3 overflow-hidden border border-border/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="bg-gradient-to-r from-primary via-brand-teal to-primary h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Progress bar glow effect */}
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
            transition={{ delay: 0.6 }}
          >
            <span className="text-xs font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Pre-built loading components for common use cases
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="xl" variant="orbit" text={text} />
  </div>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" variant="bounce" text={text} />
  </div>
);

export const ProgressLoader: React.FC<{ 
  text?: string; 
  progress: number; 
  step?: string;
}> = ({ text = "Loading...", progress, step }) => (
  <div className="flex flex-col items-center justify-center space-y-6">
    <LoadingSpinner size="lg" variant="ripple" text={text} showProgress progress={progress} />
    {step && (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.p
          className="text-primary font-medium text-sm"
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
  </div>
);

// New attractive loading components
export const AttractiveLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" variant="glow" text={text} />
  </div>
);

export const CatchyLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" variant="particles" text={text} />
  </div>
);

export const SkeletonLoader: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className="h-4 bg-muted rounded animate-pulse"
        style={{ width: `${100 - i * 10}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
  </div>
);
