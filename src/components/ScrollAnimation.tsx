import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  once?: boolean;
  threshold?: number;
}

export const ScrollAnimation = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 50,
  once = true,
  threshold = 0.1,
}: ScrollAnimationProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once,
    margin: "-50px 0px -50px 0px" // Start animation slightly before element is fully visible
  });
  const shouldReduceMotion = useReducedMotion();

  // Define animation variants based on direction
  const getVariants = (): any => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }

    const baseTransition = {
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as any
    };

    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0, transition: baseTransition }
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0, transition: baseTransition }
        };
      case "left":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0, transition: baseTransition }
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0, transition: baseTransition }
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition }
        };
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0, transition: baseTransition }
        };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

// Specialized components for common use cases
export const FadeIn = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <ScrollAnimation direction="fade" delay={delay} className={className}>
    {children}
  </ScrollAnimation>
);

export const SlideUp = ({ children, className = "", delay = 0, distance = 30 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) => (
  <ScrollAnimation direction="up" delay={delay} distance={distance} className={className}>
    {children}
  </ScrollAnimation>
);

export const SlideDown = ({ children, className = "", delay = 0, distance = 30 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) => (
  <ScrollAnimation direction="down" delay={delay} distance={distance} className={className}>
    {children}
  </ScrollAnimation>
);

export const SlideLeft = ({ children, className = "", delay = 0, distance = 30 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) => (
  <ScrollAnimation direction="left" delay={delay} distance={distance} className={className}>
    {children}
  </ScrollAnimation>
);

export const SlideRight = ({ children, className = "", delay = 0, distance = 30 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) => (
  <ScrollAnimation direction="right" delay={delay} distance={distance} className={className}>
    {children}
  </ScrollAnimation>
);

// Staggered animation for multiple children
interface StaggeredAnimationProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
}

export const StaggeredAnimation = ({
  children,
  className = "",
  staggerDelay = 0.1,
  direction = "up",
  distance = 30,
}: StaggeredAnimationProps) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollAnimation
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          distance={distance}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  );
};
