import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, ArrowLeft, Sparkles } from 'lucide-react';

interface LegalProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export function Legal({ type, onBack }: LegalProps) {
  const isPrivacy = type === 'privacy';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-cream pt-32 pb-20 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40 hover:text-[#ff00e5] transition-colors mb-16"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Protocol
        </button>

        <div className="space-y-20">
          <header className="space-y-8">
            <div className="w-20 h-20 rounded-[2rem] bg-charcoal flex items-center justify-center shadow-2xl relative">
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ff00e5] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {isPrivacy ? (
                <Shield className="w-10 h-10 text-cream" />
              ) : (
                <FileText className="w-10 h-10 text-cream" />
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl font-serif italic leading-none text-charcoal">
                {isPrivacy ? 'Privacy' : 'Terms'} <span className="text-charcoal/20">Policy</span>
              </h1>
              <p className="text-[#ff00e5] font-black uppercase tracking-[0.2em] text-[10px]">
                Revision Matrix: v2.4.0 — Last updated: April 13, 2026
              </p>
            </div>
          </header>

          <div className="prose prose-charcoal max-w-none">
            {isPrivacy ? (
              <div className="space-y-16 text-charcoal/70 leading-relaxed text-xl font-light">
                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">1. Data Anonymization</h2>
                  <p>
                    We maintain a protocol of radical privacy. This application does not require a user account, and we do not store personally identifiable information (PII). Your identity remains decoupled from your physical parameters.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">2. Computational Processing</h2>
                  <p>
                    When a routine is synthesized, your parameters (experience levels, target regions, durations) are processed in real-time. This configuration is ephemeral and not stored in a persistent relational database.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">3. Advertising Logic</h2>
                  <p>
                    Third-party partners, including Ezoic, facilitate ad delivery. These entities may deploy cookies for analytics and preference matching. Detailed configuration is accessible via our integrated Consent Management Platform.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">4. Session Persistence</h2>
                  <p>
                    Essential cookies are utilized solely to maintain session state for your current mobility objectives. These tokens do not track behavior across external domains or network headers.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-16 text-charcoal/70 leading-relaxed text-xl font-light">
                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">1. Algorithmic Acceptance</h2>
                  <p>
                    Engaging with this platform constitutes a binding agreement to these terms. Continued utilization represents consistent acknowledgment of our operating standards.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">2. Medical Authorization</h2>
                  <p className="font-bold text-charcoal border-l-4 border-[#ff00e5] pl-6 italic bg-charcoal/5 py-6">
                    MANDATORY: This platform is for informational synthesis only. Professional medical consultation is strictly required prior to implementing new biomechanical protocols.
                  </p>
                  <p>
                    Biomechanical tension carries inherent risk of injury. By initializing a protocol, you assume all liability and waive claims against the developers and data providers.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">3. IP Protocol</h2>
                  <p>
                    Synthesized routines are licensed for individual, non-commercial utilization. Reproduction for commercial profit or inclusion in paid training frameworks without explicit certification is prohibited.
                  </p>
                </section>

                <section className="space-y-6">
                  <h2 className="text-3xl font-serif italic text-charcoal">4. Liability Boundaries</h2>
                  <p>
                    Services are rendered "as-is" without warranty. We do not guarantee specific physiological outcomes or permanent mobility improvements through the use of this interface.
                  </p>
                </section>
              </div>
            )}
          </div>

          <div className="pt-20 border-t border-charcoal/10">
            <div className="bg-charcoal p-12 md:p-20 rounded-[4rem] text-cream flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff00e5]/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <div className="space-y-4 text-center md:text-left relative z-10">
                <h3 className="text-3xl md:text-4xl font-serif italic">Operational Support</h3>
                <p className="text-cream/50 text-lg font-light">Direct communication for policy clarification and technical audit.</p>
              </div>
              <a 
                href="mailto:protocol@stretchingprogram.com"
                className="relative z-10 px-12 py-5 bg-[#ff00e5] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl shadow-pink-500/20"
              >
                Reach Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
