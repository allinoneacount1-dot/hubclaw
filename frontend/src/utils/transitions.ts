export const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.4, ease: 'easeIn' } }
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.08, staggerDirection: -1 } }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', mass: 0.5, damping: 18 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};
