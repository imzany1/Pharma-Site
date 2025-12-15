"use client"

import { motion } from "framer-motion"
import { ArrowRight, Microscope, ShieldCheck, Globe, Activity } from "lucide-react"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <div className="flex flex-col gap-32 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Light mode only: Subtle grid pattern */}
        <div className="absolute inset-0 dark:hidden" style={{
          backgroundImage: `
            linear-gradient(to right, #f0f7ff 1px, transparent 1px),
            linear-gradient(to bottom, #f0f7ff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
        
        {/* Soft gradient overlays */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]" />
          <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary/2 blur-[120px]" />
        </div>
        
        <div className="container px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Leading the future of medicine
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Innovating for a <br />
              <span className="text-primary">
                Healthier Tomorrow
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We combine breakthrough science with human-centric care to develop life-changing therapies for global challenges.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/about" 
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all flex items-center gap-2 hover:scale-105 dark:hover:scale-100 shadow-lg dark:shadow-none hover:shadow-2xl dark:hover:shadow-none"
              >
                Discover Our Mission <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-white dark:bg-slate-800 text-foreground border border-border rounded-full font-semibold text-lg transition-all hover:scale-105 dark:hover:scale-100 hover:shadow-xl dark:hover:shadow-none"
              >
                Partner With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 rounded-3xl bg-primary/5 p-12 border border-primary/10">
          {[
            { label: "Patients Served", value: "10M+" },
            { label: "Countries", value: "50+" },
            { label: "R&D Investment", value: "$2B" },
            { label: "Employees", value: "5000+" },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center space-y-2"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</h3>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Pioneering Solutions</h2>
          <p className="text-muted-foreground text-lg">
            Our commitment to excellence drives every aspect of our work, from research to delivery.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <Microscope className="w-8 h-8 text-primary" />,
              title: "Advanced Research",
              description: "Utilizing cutting-edge biotechnology to discover novel treatments for rare diseases."
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
              title: "Quality Assurance",
              description: "Rigorous safety protocols ensuring the highest standards in pharmaceutical production."
            },
            {
              icon: <Globe className="w-8 h-8 text-blue-500" />,
              title: "Global Access",
              description: "Dedicated to making essential medicines accessible to communities worldwide."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="p-8 rounded-2xl bg-card border border-border transition-all group hover:-translate-y-2 dark:hover:translate-y-0 hover:shadow-2xl dark:hover:shadow-none"
            >
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container px-6">
        <div className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 md:p-20 gap-10">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Shape the Future?</h2>
              <p className="text-primary-foreground/90 text-lg">
                Join us in our mission to transform global healthcare. Whether you are a partner, investor, or job seeker.
              </p>
            </div>
            <Link 
              href="/contact"
              className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-slate-50 transition-colors shadow-xl"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
