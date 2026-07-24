import { motion } from "framer-motion";

export function DotsLoader() {
  const dotVariants = {
    hidden: { y: 0, opacity: 0.3, scale: 0.8 },
    show: { y: -15, opacity: 1, scale: 1.1 }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] space-x-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 bg-white rounded-full shadow-lg shadow-white/40"
          variants={dotVariants}
          initial="hidden"
          animate="show"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}