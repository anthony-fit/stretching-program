import React from 'react';
import { motion } from 'motion/react';
import { Mail, User } from 'lucide-react';

export function Contact() {
  return (
    <div className="py-32 px-6">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <span className="text-gold font-bold uppercase tracking-[0.3em] text-[10px]">Get In Touch</span>
          <h1 className="text-5xl md:text-6xl font-serif italic text-charcoal">Contact Us</h1>
          <p className="text-charcoal/60 leading-relaxed max-w-xl mx-auto font-light">
            Have questions about the stretching protocols or need assistance? Please don't hesitate to reach out.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] p-12 border border-charcoal/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center p-8 text-center bg-charcoal/5 rounded-2xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <User className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">Founder</h3>
              <p className="text-charcoal/60 font-light">Anthony Wedderburn</p>
            </div>

            <div className="flex flex-col items-center p-8 text-center bg-charcoal/5 rounded-2xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Mail className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">Email</h3>
              <a href="mailto:stretchingprogram@gmail.com" className="text-gold font-medium hover:text-gold/80 transition-colors">
                stretchingprogram@gmail.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
