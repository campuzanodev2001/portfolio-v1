"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import RevealOnScroll from "./animations/RevealOnScroll";
import StaggerGrid from "./animations/StaggerGrid";

const projects = [
  {
    id: "TS_01",
    badge: "DEMO",
    title: "NZ Automotores",
    description:
      "Website for a used car dealership in Mar del Plata. Conversion-focused landing with team, location, and featured cars; catalog with search, filters by category, price, and mileage, and WhatsApp CTAs with pre-filled messages per car. Admin panel for stock management without touching code.",
    mobileDescription:
      "Conversion-focused dealership site with catalog, WhatsApp CTAs per car, and a no-code stock admin panel.",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS", "Firebase", "Cloudinary"],
    mobileStack: ["NEXT.JS", "FIREBASE", "CLOUDINARY", "WHATSAPP"],
    image: "/nz.png",
    deploy: "https://nzautomotores.vercel.app/",
    glowColor: "bg-[#00dddd]/20",
  },
  {
    id: "TS_02",
    badge: "E-COMM",
    title: "The Box",
    description:
      "E-commerce for a premium women's footwear and accessories brand based in Mar del Plata. Built on Tiendanube with MercadoPago integration and a mobile-first shopping experience designed around the brand's aesthetic.",
    mobileDescription:
      "Mobile-first e-commerce for a premium women's fashion brand, built on Tiendanube with MercadoPago.",
    stack: ["Tiendanube", "Liquid", "MercadoPago", "CSS"],
    mobileStack: ["TIENDANUBE", "LIQUID", "MERCADOPAGO"],
    image: "/thebox.png",
    deploy: "https://theboxmdp.com.ar/",
    glowColor: "bg-[#28ff1d]/10",
  },
  {
    id: "TS_03",
    badge: "E-COMM",
    title: "Portal Store",
    description:
      "Online store for the first gaming and tech culture hub in Mar del Plata. Multi-category catalog featuring brands like ASUS, developed on Rubicom with a layout built to handle large inventories and diverse product lines.",
    mobileDescription:
      "Multi-category gaming store for Mar del Plata's first tech hub, featuring ASUS and more.",
    stack: ["Rubicom", "CSS"],
    mobileStack: ["RUBICOM", "CSS"],
    image: "/portal.png",
    deploy: "https://portalstore.com.ar/",
    glowColor: "bg-[#00dddd]/20",
  },
  {
    id: "TS_04",
    badge: "PORTFOLIO",
    title: "Tom Martorello",
    description:
      "Portfolio and booking site for a Mar del Plata DJ. Features an animated hero, photo gallery, venue carousel, and embedded sets via SoundCloud and YouTube. Built with GSAP and Framer Motion to match the energy of live performance.",
    mobileDescription:
      "Animated DJ portfolio with booking, photo gallery, venue carousel, and SoundCloud/YouTube sets.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Framer Motion", "GSAP"],
    mobileStack: ["NEXT.JS", "FRAMER", "GSAP"],
    image: "/tom.png",
    deploy: "https://portfolio-tom-phi.vercel.app/",
    repo: "https://github.com/campuzanodev2001/portfolio-tom",
    glowColor: "bg-[#28ff1d]/10",
  },
  {
    id: "TS_05",
    badge: "SAAS",
    title: "Tailor AI",
    description:
      "SaaS platform that uses AI to optimize resumes for specific job postings. Upload a CV and paste a job description — Gemini analyzes both, identifies gaps and missing keywords, generates an ATS-optimized version, and returns an ATS score. Usage history per user, credit-based pricing with Stripe.",
    mobileDescription:
      "AI-powered SaaS that rewrites your CV for each job posting and scores it for ATS filters.",
    stack: ["Next.js 16", "Gemini API", "Firebase", "Stripe", "Puppeteer"],
    mobileStack: ["NEXT.JS", "GEMINI", "FIREBASE", "STRIPE"],
    image: "/tailorai.png",
    deploy: "https://tailor-ai-pi.vercel.app/",
    repo: "https://github.com/TioDanx/tailor-ai",
    glowColor: "bg-[#00dddd]/20",
  },
  {
    id: "TS_06",
    badge: "PWA",
    title: "Nuestros Planes",
    description:
      "Private PWA built exclusively for two — a shared space for couples to organize plans together. Activities flow through states (todo → confirmed → done), each with maps, countdowns, photo galleries, and star reviews. Real-time sync, push notifications, .ics calendar export, and installable on mobile.",
    mobileDescription:
      "Private couples PWA with shared plans, countdowns, maps, photo galleries, and real-time sync.",
    stack: ["Next.js 16", "React 19", "Firebase", "Framer Motion", "Cloudinary"],
    mobileStack: ["NEXT.JS", "FIREBASE", "CLOUDINARY", "PWA"],
    image: "/nuestrosplanes.png",
    deploy: "https://franteamomuchomucho.vercel.app/",
    repo: "https://github.com/TioDanx/franteamomuchomucho",
    glowColor: "bg-[#28ff1d]/10",
  },
  {
    id: "TS_07",
    badge: "WIP",
    title: "Moreno Herramientas",
    description:
      "Custom e-commerce being built from the ground up for a hardware store in Argentina with 14,000+ products. The owner gets a custom admin panel — no third-party platforms, no code to touch. Full stack: payments via MercadoPago, shipping via Andreani and Correo Argentino, and integration with their existing Eleventa management system.",
    mobileDescription:
      "Custom e-commerce and admin panel for an Argentine hardware store with 14,000+ products. No Shopify, no Tiendanube — the client owns the code.",
    stack: ["Next.js 15", "TypeScript", "Tailwind CSS v4", "Supabase", "Drizzle ORM", "MercadoPago"],
    mobileStack: ["NEXT.JS", "SUPABASE", "DRIZZLE", "MERCADOPAGO"],
    image: "",
    glowColor: "bg-[#00dddd]/20",
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 lg:py-32 px-6 lg:px-16 space-y-12 lg:space-y-16">
      <RevealOnScroll direction="up">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs text-[#00dddd] tracking-[0.4em] uppercase">
              Deployment_Registry
            </p>
            <h2 className="text-4xl lg:text-6xl font-bold uppercase tracking-tighter">
              PROJECT_LOGS
            </h2>
          </div>
          <div className="text-[10px] text-[#b9cac9]/40 text-right hidden sm:block">
            ENTRIES_FOUND: 07
            <br />
            FILTER: PRODUCTION
          </div>
        </div>
      </RevealOnScroll>

      <StaggerGrid className="grid md:grid-cols-2 gap-8" staggerDelay={0.18}>
        {projects.map((project) => (
          <StaggerGrid.Item key={project.id}>
            <motion.div
              className="group relative bg-[#201f1f] border border-[#3a4a49]/30"
              whileHover={{
                y: -6,
                borderColor: "rgba(0,221,221,0.5)",
                boxShadow: "0 16px 48px rgba(0,221,221,0.1)",
                transition: { type: "spring", stiffness: 350, damping: 28 },
              }}
              whileTap={{ scale: 0.985 }}
            >
              <div
                className={`absolute -inset-0.5 ${project.glowColor} blur opacity-0 group-hover:opacity-100 transition duration-500 md:hidden`}
              />

              {/* Image */}
              <div className="relative aspect-video bg-[#353534] overflow-hidden">
                <div className="absolute inset-0 bg-[#00dddd]/5 group-hover:bg-transparent transition-colors z-10" />
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <span className="text-[10px] text-[#00dddd]/40 tracking-[0.4em] uppercase">
                      PREVIEW_PENDING
                    </span>
                    <div className="w-12 h-px bg-[#00dddd]/20" />
                    <span className="text-[9px] text-[#b9cac9]/20 tracking-widest uppercase">
                      IN_DEVELOPMENT
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(transparent, transparent 2px, rgba(0,221,221,0.04) 2px, rgba(0,221,221,0.04) 4px)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-[#00dddd]/10 backdrop-blur-sm border-t border-[#00dddd]/30 px-4 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00dddd] animate-pulse" />
                  <span className="text-[10px] text-[#00dddd] tracking-[0.3em] uppercase">
                    PREVIEW_
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-[#131313]/80 backdrop-blur text-[10px] text-[#00dddd] border border-[#00dddd]/30">
                    {project.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-[#00dddd] lg:text-white">
                      {project.title}
                    </h3>
                    <span className="material-symbols-outlined text-[#00dddd] md:hidden text-base">
                      north_east
                    </span>
                  </div>
                  <span className="text-[10px] text-[#b9cac9]/40 tracking-widest hidden md:block">
                    {project.id}
                  </span>
                </div>

                <p className="text-[#b9cac9] text-sm leading-relaxed hidden md:block">
                  {project.description}
                </p>
                <p className="text-[#b9cac9] text-sm leading-relaxed md:hidden">
                  {project.mobileDescription}
                </p>

                <div className="hidden md:flex gap-3 pt-4">
                  {project.stack.map((tech) => (
                    <span key={tech} className="text-[10px] uppercase text-[#b9cac9]/60">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 md:hidden">
                  {project.mobileStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-[#0e0e0e] px-2 py-1 text-[9px] border border-[#3a4a49]/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {(project.deploy || project.repo) && (
                  <div className="pt-4 hidden md:flex gap-3">
                    {project.deploy && (
                      <motion.a
                        href={project.deploy}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ backgroundColor: "#ffffff", color: "#003737" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 py-3 border border-[#3a4a49]/50 text-xs uppercase tracking-widest font-bold flex items-center justify-center"
                      >
                        DEPLOY_VIEW_
                      </motion.a>
                    )}
                    {project.repo && (
                      <motion.a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ backgroundColor: "#00dddd", color: "#003737" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 py-3 border border-[#00dddd]/30 text-xs uppercase tracking-widest font-bold text-[#00dddd] flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">code</span>
                        REPO_
                      </motion.a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </StaggerGrid.Item>
        ))}
      </StaggerGrid>
    </section>
  );
}
