import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
  MotionProps,
} from "framer-motion";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/* ----------------------------- Design Tokens ----------------------------- */
export const enterpriseTokens = {
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
};

/* ------------------------------- Card -------------------------------- */
type EnterpriseCardProps = MotionProps & {
  children?: ReactNode;
  className?: string;
  hover?: boolean;
};

export function EnterpriseCard({
  children,
  className,
  hover = false,
  ...props
}: EnterpriseCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2, ease: enterpriseTokens.ease } } : undefined}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
        hover && "transition-shadow hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------- AnimatedCounter ----------------------------- */
export function AnimatedCounter({
  value,
  duration = 1,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(
        v.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      );
    });
    return () => unsub();
  }, [spring, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------ StatusBadge ------------------------------ */
export function StatusBadge({
  active,
  label,
  className,
}: {
  active: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400"
        )}
      />
      {label}
    </span>
  );
}

/* ------------------------------ SkeletonCard ----------------------------- */
export function SkeletonCard({
  className,
  height = 200,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900",
        className
      )}
      style={{ minHeight: height }}
      role="status"
      aria-busy="true"
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-slate-800/50"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ------------------------------ SectionCard ------------------------------ */
export function SectionCard({
  icon,
  title,
  description,
  children,
  defaultOpen = true,
  open,
  onToggle,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}) {
  const isControlled = open !== undefined && onToggle !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  return (
    <EnterpriseCard className="overflow-visible">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => isControlled ? onToggle!() : setInternalOpen((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={isOpen}
          >
            <motion.span
              animate={{ rotate: isOpen ? 0 : -90 }}
              transition={{ duration: 0.2, ease: enterpriseTokens.ease }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </motion.button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: enterpriseTokens.ease }}
            className="overflow-hidden"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </EnterpriseCard>
  );
}

/* ----------------------------- TimelineItem ------------------------------ */
export function TimelineItem({
  dot,
  children,
  isLast,
}: {
  dot: ReactNode;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
      )}
      <div className="absolute left-0 top-1.5 grid h-6 w-6 place-items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {dot}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.3, ease: enterpriseTokens.ease }}
      >
        {children}
      </motion.div>
    </div>
  );
}