import { motion, useReducedMotion } from 'framer-motion';
import { BrandMark } from '../../components/BrandMark';

export function WelcomeBrand() {
  const shouldReduceMotion = useReducedMotion();
  const reveal = (delay: number) =>
    shouldReduceMotion
      ? {
          initial: false,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 1.1,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <div className="welcome-brand-wrap" data-testid="welcome-brand">
      <motion.div {...reveal(0)}>
        <BrandMark />
      </motion.div>
    </div>
  );
}
