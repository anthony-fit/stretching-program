import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Target, 
  Clock, 
  ChevronRight, 
  Activity, 
  Heart, 
  Move, 
  Shield, 
  Sun,
  ArrowLeft
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const WORKOUT_CATEGORIES = [
  {
    id: 'routine',
    title: 'Daily Routines',
    description: 'Essential daily movements for long-term health and vitality.',
    icon: <Sun className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-600',
    count: '3 Circuits',
    duration: '8-10m',
  },
  {
    id: 'flexibility',
    title: 'Flexibility Focus',
    description: 'Deep tissue protocols designed to increase range of motion.',
    icon: <Move className="w-6 h-6" />,
    color: 'bg-gold/10 text-gold',
    count: '4 Protocols',
    duration: '12-15m',
  },
  {
    id: 'full-body',
    title: 'Full Body Reset',
    description: 'A complete head-to-toe mobility overhaul for total recovery.',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-green-50 text-green-600',
    count: '6 Protocols',
    duration: '15-20m',
  },
  {
    id: 'pain-relief',
    title: 'Pain Relief',
    description: 'Targeted movements to alleviate chronic tension and discomfort.',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-red-50 text-red-600',
    count: '3 Circuits',
    duration: '10-12m',
  },
  {
    id: 'runners',
    title: 'For Runners',
    description: 'Specific protocols to protect joints and improve running economy.',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-orange-50 text-orange-600',
    count: '4 Protocols',
    duration: '10-15m',
  },
  {
    id: 'lower-body',
    title: 'Lower Body',
    description: 'Focus on hips, hamstrings, and glutes for explosive power.',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-purple-50 text-purple-600',
    count: '4 Circuits',
    duration: '12-15m',
  },
  {
    id: 'posture',
    title: 'Posture Correction',
    description: 'Counteract the effects of desk work and improve alignment.',
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-teal-50 text-teal-600',
    count: '4 Protocols',
    duration: '10m',
  },
  {
    id: 'back',
    title: 'Back Health',
    description: 'Strengthen and stretch the spine for a bulletproof back.',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-indigo-50 text-indigo-600',
    count: '3 Circuits',
    duration: '8-12m',
  },
  {
    id: 'upper-body',
    title: 'Upper Body',
    description: 'Release tension in the neck, shoulders, and chest.',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-50 text-pink-600',
    count: '3 Protocols',
    duration: '10-12m',
  }
];

export default function WorkoutsPage() {
  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Stretching Workouts", url: "/workouts" }
  ];

  return (
    <div className="pt-24 px-6 min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold font-bold uppercase tracking-[0.3em] text-[10px]">Verified Protocols</span>
            <h1 className="text-5xl md:text-7xl font-serif text-charcoal mt-4 mb-8">
              Stretching <span className="italic text-gold">Workouts</span>
            </h1>
            <p className="text-xl text-charcoal/60 max-w-2xl font-light leading-relaxed">
              Explore our laboratory-verified stretching protocols designed to solve specific physical pain points and performance goals.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {WORKOUT_CATEGORIES.map((category, idx) => (
            <motion.a
              key={category.id}
              href={`/stretching-routine/${category.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group bg-white rounded-[2.5rem] p-10 border border-charcoal/5 hover:border-gold/30 hover:shadow-[0_40px_80px_rgba(197,160,89,0.08)] transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex-1 space-y-6 relative z-10">
                <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center mb-8`}>
                  {category.icon}
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-serif text-charcoal group-hover:text-gold transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-charcoal/50 leading-relaxed font-light font-sans text-base">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30">
                    <Activity className="w-3.5 h-3.5" /> {category.count}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30">
                    <Clock className="w-3.5 h-3.5" /> {category.duration}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-charcoal/5 flex items-center justify-between group-hover:border-gold/20 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/80 group-hover:text-gold transition-colors">
                  View Routine
                </span>
                <div className="w-10 h-10 rounded-full border border-charcoal/5 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-500">
                  <ChevronRight className="w-4 h-4 text-charcoal/20 group-hover:text-white" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Feature Quote */}
        <section className="py-20 border-t border-charcoal/5">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-3xl md:text-4xl font-serif italic text-charcoal leading-snug">
              "Consistency in targeted stretching is the bridge between temporary relief and permanent mobility."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-gold/30" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Verified Clinical Principle</span>
              <div className="w-12 h-px bg-gold/30" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
