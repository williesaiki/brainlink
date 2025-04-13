import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { colors } from "../../config/colors";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      if (current > 0.001) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    if (link.startsWith('#')) {
      const targetId = link.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          `flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-[#E5E5E5]/10 rounded-full ${colors.bg.glass} z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4`,
          className
        )}
      >
        {navItems.map((navItem: any, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            onClick={(e) => handleClick(e, navItem.link)}
            className={cn(
              "relative text-gray-400 items-center flex space-x-1 hover:text-white transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <Link
          to="/login"
          className="border text-sm font-medium relative border-[#E5E5E5]/10 text-white px-4 py-2 rounded-full hover:bg-[#010220]/50 transition-colors"
        >
          <span>Zaloguj się</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent h-px" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};