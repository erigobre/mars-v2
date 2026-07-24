import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function FadeUpContainer({
  children,
  className = "",
  staggerDelay = 0.15,
}: ContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
};

export function FadeUpItem({ children, className = "" }: ItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number; // Permite un ligero retraso manual si tienes elementos lado a lado
};

export function FadeUp({ children, className = "", delay = 0 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} // Empieza más abajo (50px) para que se note más
      whileInView={{ opacity: 1, y: 0 }}
      // 'once: true' evita que se repita si subes y bajas. 
      // 'margin: "-10%"' obliga al usuario a hacer scroll para verlo aparecer.
      viewport={{ once: true, margin: "-10%" }} 
      transition={{ 
        duration: 0.6, 
        ease: "easeOut", 
        delay: delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}