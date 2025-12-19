"use client"

import { motion } from "framer-motion"
import { Users, Target, Heart, Award, Building, Microscope } from "lucide-react"

export default function About() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-muted/50 py-20 px-6">
        {/* Light mode only: Subtle dot pattern */}
        <div className="absolute inset-0 dark:hidden opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #0066CC 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="container mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Our Journey of Innovation
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Founded on the belief that everyone deserves access to life-saving medicines, PharmaCorp has been at the forefront of pharmaceutical breakthroughs for over three decades.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="w-10 h-10 text-primary" />,
              title: "Mission",
              text: "To discover, develop, and deliver innovative medicines that help patients prevail over serious diseases."
            },
            {
              icon: <Heart className="w-10 h-10 text-secondary" />,
              title: "Values",
              text: "Integrity, Compassion, Innovation, and Excellence constitute the core pillars of our corporate culture."
            },
            {
              icon: <Award className="w-10 h-10 text-blue-500" />,
              title: "Vision",
              text: "To be the world's most trusted partner in healthcare, redefining the standards of patient care."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border transition-all hover:-translate-y-2 dark:hover:translate-y-0 hover:shadow-2xl dark:hover:shadow-none"
            >
              <div className="bg-primary/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-muted-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats/History Context */}
      <section className="container px-6">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">30 Years of Excellence</h2>
              <p className="opacity-90 text-lg leading-relaxed">
                From a small research lab to a global healthcare leader, our history is defined by a relentless pursuit of scientific truth. We have successfully launched over 50 major therapeutic drugs now used worldwide.
              </p>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">1993</div>
                  <div className="text-sm opacity-75">Founded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm opacity-75">Global Centers</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Building className="w-full h-64 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="container px-6 mb-20">
        <h2 className="text-3xl font-bold text-center mb-16">Leadership Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Dr. Elena Rossi", role: "CEO", initials: "ER" },
            { name: "James Chen", role: "Chief Scientific Officer", initials: "JC" },
            { name: "Sarah Williams", role: "Head of Operations", initials: "SW" },
            { name: "Michael Chang", role: "CFO", initials: "MC" }
          ].map((leader, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center group"
            >
              <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center text-2xl font-bold text-muted-foreground mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {leader.initials}
              </div>
              <h3 className="text-lg font-bold">{leader.name}</h3>
              <p className="text-primary font-medium text-sm">{leader.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
