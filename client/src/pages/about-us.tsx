import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer"; 

// ─── Asset import (Vite / CRA style) ─────────────────────────────────────────
import founderImg from "@/assets/FoyajAhmmadFarabi.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatProps         { value: string; label: string; delay: number; }
interface SkillProps        { name: string; level: number; color: string; delay: number; }
interface TimelineItemProps { year: string; title: string; company: string; description: string; index: number; side: "left" | "right"; }
interface EduCardProps      { degree: string; institution: string; location: string; period: string; detail: string; index: number; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS: StatProps[] = [
  { value: "4+",  label: "Years Experience", delay: 0   },
  { value: "60+", label: "Clients / Month",  delay: 0.1 },
  { value: "25%", label: "Sales Conversion", delay: 0.2 },
  { value: "43%", label: "Revenue Growth",   delay: 0.3 },
];

const SKILLS: SkillProps[] = [
  { name: "Full-Stack TypeScript", level: 92, color: "#e53e3e", delay: 0   },
  { name: "React & Node.js",       level: 88, color: "#c53030", delay: 0.1 },
  { name: "Client Experience",     level: 96, color: "#e53e3e", delay: 0.2 },
  { name: "CRM & Operations",      level: 85, color: "#c53030", delay: 0.3 },
  { name: "Digital Marketing",     level: 80, color: "#e53e3e", delay: 0.4 },
  { name: "Team Leadership",       level: 90, color: "#c53030", delay: 0.5 },
];

const TIMELINE: Omit<TimelineItemProps, "index" | "side">[] = [
  {
    year: "2023 – Present",
    title: "Client Experience & Operations Executive",
    company: "Route 2 Migrate",
    description: "Managing 60+ clients monthly across end-to-end immigration journeys for Canada. Reduced case errors by 30% via CRM tracking and drove a 43% increase in qualified leads through digital campaigns.",
  },
  {
    year: "2021 – 2023",
    title: "Call Center Representative (Tele-Sales)",
    company: "TeleCampus BPO",
    description: "Achieved 25% conversion rate across international brands. Recognised as Employee of the Month three consecutive months. Built onboarding program that cut ramp-up time by 35%.",
  },
  {
    year: "2020 – 2021",
    title: "Call Center Executive (Tele Sales)",
    company: "Synergy Business Solution",
    description: "Progressed to Senior Employee within tenure. Ran outbound cold-calling campaigns across solar energy, health insurance, and home warranty verticals, consistently exceeding monthly targets.",
  },
];

const EDUCATION: Omit<EduCardProps, "index">[] = [
  {
    degree:      "B.Sc. in Computer Science & Engineering",
    institution: "Anwer Khan Modern University",
    location:    "Uttara, Dhaka",
    period:      "Aug 2021 – Present",
    detail:      "Final Year Student · Average CGPA 3.56 (Till 7th Semester) · Thesis: PulseCare – Blood & Donor Management System, a GDPR/HIPAA-compliant real-time donor matching platform.",
  },
  {
    degree:      "Higher Secondary Certificate (HSC)",
    institution: "Sompara College",
    location:    "Chatkhil, Noakhali",
    period:      "Apr 2019 – Jul 2020",
    detail:      "Science Major · GPA 4.42 / 5.00",
  },
  {
    degree:      "Secondary School Certificate (SSC)",
    institution: "Narayanpur R.K. High School",
    location:    "Chatkhil, Noakhali",
    period:      "Jan 2016 – May 2017",
    detail:      "Science Major · GPA 4.27 / 5.00",
  },
];

const CERTS = [
  "Full Stack Digital Marketing",
  "Professional Content Writing",
  "Introduction to Cybersecurity",
  "Data Analytics with Python",
  "Fundamentals of Digital Marketing",
];

const SOCIALS = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/farbistaa/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/farbistaa/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/farbista/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

// ─── Reusable micro-components ────────────────────────────────────────────────

function FloatingBlob({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], x: [0, 12, 0], y: [0, -10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function AnimatedStat({ value, label, delay }: StatProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  // Parse the string value (e.g., "4+" or "25%") into number and suffix
  const parsedValue = value.match(/(\d+)(.*)/);
  const targetNumber = parsedValue ? parseInt(parsedValue[1], 10) : 0;
  const suffix = parsedValue ? parsedValue[2] : "";

  useEffect(() => {
    if (inView) {
      // Start counting after the entry animation delay begins
      const timer = setTimeout(() => {
        let startTimestamp: number | null = null;
        const duration = 2000; // 2 seconds for the count up

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          
          // Cubic ease-out function for smooth animation
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          setCount(Math.floor(easeProgress * targetNumber));

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            setCount(targetNumber); // Ensure we hit the exact target number at the end
          }
        };

        window.requestAnimationFrame(step);
      }, delay * 1000 + 200); // Add a small buffer after the slide-in starts

      return () => clearTimeout(timer);
    }
  }, [inView, delay, targetNumber]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        className="text-4xl md:text-5xl font-black text-red-500 mb-1 leading-none"
        animate={inView ? { scale: [0.8, 1.05, 1] } : {}}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{label}</div>
    </motion.div>
  );
}

function SkillBar({ name, level, color, delay }: SkillProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-300">{name}</span>
        <span className="text-sm font-bold text-red-400">{level}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, #fc8181)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ year, title, company, description, index, side }: TimelineItemProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = side === "left";

  return (
    <div ref={ref} className={`relative flex items-start gap-6 mb-10 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <motion.div
        className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <div className="inline-block bg-slate-900 border border-slate-700 hover:border-red-500/50 rounded-2xl p-5 transition-colors duration-300 cursor-default max-w-sm">
          <div className={`text-xs font-bold text-red-400 uppercase tracking-widest mb-1 ${isLeft ? "text-right" : "text-left"}`}>{year}</div>
          <h3 className={`font-bold text-white text-sm leading-snug mb-0.5 ${isLeft ? "text-right" : "text-left"}`}>{title}</h3>
          <div className={`text-red-500 text-xs font-semibold mb-2 ${isLeft ? "text-right" : "text-left"}`}>{company}</div>
          <p className={`text-slate-400 text-xs leading-relaxed ${isLeft ? "text-right" : "text-left"}`}>{description}</p>
        </div>
      </motion.div>

      <div className="relative flex-shrink-0 flex flex-col items-center">
        <motion.div
          className="w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 z-10 ring-2 ring-red-500/30"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
        />
      </div>

      <div className="flex-1" />
    </div>
  );
}

function EduCard({ degree, institution, location, period, detail, index }: EduCardProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ y: -4 }}
      className="relative bg-slate-900 border border-slate-700 hover:border-red-500/40 rounded-2xl p-6 cursor-default transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,62,62,0.08)]"
    >
      <div className="absolute left-0 top-5 bottom-5 w-1 bg-gradient-to-b from-red-500 to-rose-700 rounded-full" />
      <div className="pl-5">
        <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-0.5 mb-3">
          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{period}</span>
        </div>
        <h3 className="text-white font-bold text-base leading-snug mb-2">{degree}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-red-400 text-sm font-semibold">{institution}</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {location}
          </span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function AboutUs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  // DEBUG LOGGING
  useEffect(() => {
    const logLayout = () => {
      console.log("=== LAYOUT DEBUG INFO ===");
      const body = document.body;
      const root = document.getElementById('root');
      console.log("Document Body Height:", body.scrollHeight);
      console.log("Document Body Client Height:", body.clientHeight);
      console.log("Root Element Height:", root?.scrollHeight);
      if (containerRef.current) {
        console.log("Component Container Height:", containerRef.current.scrollHeight);
        console.log("Component Container Offset Height:", containerRef.current.offsetHeight);
      }
      console.log("Window Inner Height:", window.innerHeight);
      console.log("========================");
    };

    logLayout();
    const timer = setTimeout(logLayout, 1000);
    window.addEventListener('scroll', logLayout);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', logLayout);
    };
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) =>
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full text-white font-sans flex flex-col min-h-screen relative overflow-x-hidden"
      style={{ background: '#09090b' }} 
    >
      {/* Component Specific Styles + CRITICAL FIXES */}
      <style>{`
        /* IMPORT FONTS */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        
        /* GLOBAL OVERRIDES TO FIX HEIGHT MISMATCH */
        html, body {
          /* Force body to expand with content instead of clamping at 100vh */
          height: auto !important;
          min-height: 100vh !important;
        }
        
        #root {
          /* Force root to expand with content instead of having fixed phantom height */
          height: auto !important;
          min-height: 100vh !important;
          overflow: visible !important;
        }

        /* Typography & Utilities */
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .display { font-family: 'Syne', sans-serif; }
        
        .grain::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.35;
        }
        .blood-glow { box-shadow: 0 0 60px 0 rgba(229,62,62,0.15); }
        .timeline-line {
          position: absolute; left: 50%; transform: translateX(-50%);
          top: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, #e53e3e 15%, #e53e3e 85%, transparent);
        }
      `}</style>

      <div className="grain" />

      {/* ───────────────── HERO ───────────────────────────────────────────── */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#09090b] z-0">
          <FloatingBlob className="w-[500px] h-[500px] bg-red-700 -top-20 -left-48" />
          <FloatingBlob className="w-72 h-72 bg-red-900 bottom-24 right-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(229,62,62,0.08)_0%,transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(229,62,62,0.7) 1px, transparent 1px),linear-gradient(90deg, rgba(229,62,62,0.7) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </motion.section>

      <div className="relative z-10 flex flex-col flex-grow">
        
        <motion.div className="min-h-screen flex items-center justify-center px-6 pb-16 pt-24">
          <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center pointer-events-auto">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Founder &amp; Creator · PulseCare</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="display text-5xl md:text-7xl font-black leading-[1.05] mb-5 tracking-tight"
              >
                Foyaj<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Ahmmad</span><br />
                Farabi
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {["Full-Stack Developer", "CX Professional", "HealthTech Builder"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="text-slate-400 text-base leading-relaxed max-w-md mb-4 font-light"
              >
                Architect of <span className="text-red-400 font-medium">PulseCare</span> — Bangladesh's most
                intelligent blood donation ecosystem. Combining 4+ years of client experience leadership with
                full-stack TypeScript engineering to solve real-world problems.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.36 }}
                className="flex flex-wrap items-center gap-3 text-slate-500 text-sm mb-8"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Nikunjo-2, Dhaka, Bangladesh
                </span>
                <span className="text-slate-700">·</span>
                <a href="tel:+8801567860719" className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  01567-860719
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.44 }}
                className="flex items-center gap-3 flex-wrap"
              >
                {SOCIALS.map((s) => (
                  <motion.a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onHoverStart={() => setHoveredSocial(s.name)}
                    onHoverEnd={() => setHoveredSocial(null)}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors duration-200"
                  >
                    {s.icon}
                    <AnimatePresence>
                      {hoveredSocial === s.name && (
                        <motion.span
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-red-400 whitespace-nowrap font-semibold pointer-events-none"
                        >
                          {s.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.a>
                ))}

                <div className="w-px h-6 bg-slate-700 mx-1" />

                <motion.a
                  href="mailto:farbistaa@gmail.com"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Get in Touch
                </motion.a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              style={{ rotateX: -mousePos.y * 0.25, rotateY: mousePos.x * 0.25 }}
              className="relative mx-auto max-w-[360px] w-full"
            >
              <div className="absolute -inset-4 rounded-3xl border border-red-500/20 rotate-2 pointer-events-none" />
              <div className="absolute -inset-8 rounded-3xl border border-red-500/10 -rotate-1 pointer-events-none" />
              <div className="relative blood-glow rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-900">
                {!imgError ? (
                  <img
                    src={founderImg}
                    alt="Foyaj Ahmmad Farabi — Founder of PulseCare"
                    onError={() => setImgError(true)}
                    className="w-full object-cover object-top"
                    style={{ aspectRatio: "3/4" }}
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center bg-gradient-to-br from-red-900/40 to-slate-900"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <span style={{ fontFamily: "Syne,sans-serif", fontSize: "6rem", fontWeight: 900, color: "#e53e3e", opacity: 0.55 }}>
                      FA
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/55 to-transparent">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-white font-bold text-sm leading-tight">Foyaj Ahmmad Farabi</div>
                      <div className="text-red-400 text-xs mt-0.5">Dhaka, Bangladesh</div>
                    </div>
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider leading-tight text-center shrink-0">
                      BSc<br />CSE '25
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-600/30 whitespace-nowrap z-10"
              >
                🩸 PulseCare Creator
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>

        <section className="relative py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">The Mission · PulseCare</span>
              </div>

              <h2 className="display text-4xl md:text-6xl font-black mb-6 leading-tight">
                Every <span className="text-red-500">Pulse</span> Counts
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-12 font-light">
                Witnessing Bangladesh's blood shortage crisis — over 200,000 bags deficit annually — Foyaj built
                PulseCare: a full-stack, GDPR &amp; HIPAA-compliant platform connecting verified donors to those in
                need through real-time intelligent matching, OTP verification, and geolocation-based emergency alerts.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Real-Time Donor Matching", "OTP Authentication", "Geolocation Alerts",
                  "AES-256 Encryption", "GDPR & HIPAA Compliant", "Role-Based Access",
                  "Admin Analytics Dashboard", "Emergency Blood Requests",
                ].map((f, i) => (
                  <motion.span
                    key={f}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full hover:border-red-500/40 hover:text-red-300 transition-colors duration-200 cursor-default"
                  >
                    {f}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6 border-y border-slate-800 bg-slate-950/40">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">By The Numbers</span>
              </div>
              <h2 className="display text-3xl md:text-4xl font-black">
                Impact &amp; <span className="text-red-500">Achievements</span>
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Four years of measurable outcomes across client experience, sales performance, and operational leadership.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {STATS.map((s) => <AnimatedStat key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Academic Background</span>
              </div>
              <h2 className="display text-4xl md:text-5xl font-black">
                Education &amp; <span className="text-red-500">Qualifications</span>
              </h2>
              <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto">
                A strong Science foundation through secondary and tertiary education, culminating in a CSE degree with real-world thesis impact.
              </p>
            </motion.div>

            <div className="grid gap-5">
              {EDUCATION.map((ed, i) => <EduCard key={ed.degree} {...ed} index={i} />)}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                  <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Expertise</span>
                </div>
                <h2 className="display text-4xl md:text-5xl font-black mb-4 leading-tight">
                  Skills &amp;<br /><span className="text-red-500">Proficiency</span>
                </h2>
                <p className="text-slate-400 leading-relaxed font-light mb-8">
                  A rare blend of full-stack engineering and client operations excellence — Foyaj bridges the gap
                  between technical execution and human-centred service delivery.
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Certifications</p>
                  {CERTS.map((c, i) => (
                    <motion.div
                      key={c}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 text-slate-400 text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {c}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {SKILLS.map((s) => <SkillBar key={s.name} {...s} />)}
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Journey</span>
              </div>
              <h2 className="display text-4xl md:text-5xl font-black">
                Career <span className="text-red-500">Timeline</span>
              </h2>
            </motion.div>

            <div className="relative">
              <div className="timeline-line hidden md:block" />
              {TIMELINE.map((item, i) => (
                <TimelineItem key={item.title} {...item} index={i} side={i % 2 === 0 ? "left" : "right"} />
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────── QUOTE / CTA ────────────────────────────────────── */}
        <section className="py-16 px-6 relative overflow-hidden">
          <FloatingBlob className="w-72 h-72 bg-red-700 top-0 right-10" />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 md:p-10 pb-6"
            >
              <div className="text-white/10 text-8xl font-black leading-none mb-4 select-none">"</div>
              <blockquote className="display text-2xl md:text-3xl font-bold text-white leading-snug mb-8">
                Technology should save lives, not just automate tasks. PulseCare exists because{" "}
                <span className="text-red-400">every second counts</span> in a blood emergency.
              </blockquote>

              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="https://www.linkedin.com/in/farbista/"
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200 text-sm shadow-lg shadow-red-600/20"
                >
                  Connect on LinkedIn
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.a>
                <motion.a
                  href="https://github.com/farbistaa/Pulsecare"
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  View Source on GitHub
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;