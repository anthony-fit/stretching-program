import React from 'react';
import { motion } from 'motion/react';

export function HomePageSEO() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
      <div className="text-center max-w-4xl mx-auto mb-20 space-y-8">
        <h2 className="text-4xl md:text-6xl font-serif italic text-charcoal tracking-tighter leading-tight">
          Science & <span className="text-gold">Movement</span>
        </h2>
        <p className="text-xl md:text-2xl text-charcoal/70 font-light leading-relaxed">
          A <a href="https://stretchingprogram.com/nutrition" className="text-gold underline decoration-gold/30 hover:decoration-gold transition-colors">proper nutrition strategy</a> combined with a full-body stretching routine builds a strong foundation. You can enjoy free workout apps that customize every stretch to match your unique goals. Our system adapts to your level, whether you are a beginner or an athlete seeking improved flexibility and athletic performance.
        </p>
      </div>

      <div className="space-y-24 md:space-y-32">
        {/* Section 1: Editorial Left/Right */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
            <h2 className="text-3xl md:text-5xl font-black text-charcoal tracking-tight mb-6">What happens when you stretch?</h2>
            <div className="text-lg text-charcoal/70 space-y-6">
              <p>
                When you stretch, you lengthen your muscle groups and enhance your full range of motion. A good stretch stimulates an increase in blood flow to the targeted area. This process helps your body recover faster and prepares your muscles for exercise.
              </p>
              <p>
                According to the <a href="https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20047931" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline transition-colors">Mayo Clinic — Stretching: Focus on flexibility</a>, basic stretches can prevent injury and optimize motion in your joints. You should aim to hold the stretch for at least 20 seconds. This action allows the muscle group to relax and adapt to the new length.
              </p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2 relative group">
            <div className="absolute inset-0 bg-gold/10 rounded-[3rem] translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop" alt="Person performing a deep lunge stretch showing full range of motion" className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full relative z-10" />
          </motion.div>
        </section>

        {/* Section 2: Bento Grid 3 columns */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.5 }} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-charcoal/5 flex flex-col group hover:-translate-y-2 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Why is pnf stretching effective?</h2>
            <div className="text-charcoal/70 space-y-4 flex-1">
              <p>
                Proprioceptive Neuromuscular Facilitation or PNF stretching is a highly effective stretch technique. You tighten a muscle and then stretch it to deepen the stretch. Physical therapists often recommend this exercise to quickly boost your flexibility and improve your range of motion.
              </p>
              <p>
                Many free gym workout apps incorporate PNF techniques to reduce your risk of injuries. You can start on all fours or lie flat on the floor to perform these static stretches. Just ensure you keep your back straight and listen to your body stretch.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop" alt="Athlete performing PNF stretching with a trainer" className="rounded-2xl mt-8 w-full h-48 object-cover filter brightness-95 group-hover:brightness-100 transition-all duration-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="bg-charcoal text-cream rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white/5 flex flex-col transform z-10 group md:scale-105 hover:-translate-y-2">
            <h2 className="text-2xl font-bold text-cream mb-4">How should a beginner start stretching?</h2>
            <div className="text-cream/70 space-y-4 flex-1">
              <p>
                A beginner should start with a gentle full body stretch to warm up major muscle groups. You can create a full-body stretching routine that takes only a few minutes every day. Stand with feet apart and gently bend to touch your toes.
              </p>
              <p>
                A <a href="https://www.health.harvard.edu/staying-healthy/the-ideal-stretching-routine" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 underline transition-colors">Harvard Health — The ideal stretching routine</a> advises consistency over intensity. Regular stretching helps eliminate back pain and improves overall posture. Start your daily routine with light dynamic stretches before trying longer static holds.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800" alt="Beginner doing a gentle full body stretch" className="rounded-2xl mt-8 w-full h-48 object-cover filter brightness-95 group-hover:brightness-100 transition-all duration-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} whileHover={{ scale: 1.02 }} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-charcoal/5 flex flex-col group hover:-translate-y-2 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-charcoal mb-4">Are there good free gym workout apps near me?</h2>
            <div className="text-charcoal/70 space-y-4 flex-1">
              <p>
                You can access free workout apps anywhere without looking for a gym near me. Our AI application acts as a personal physical therapist in your pocket. You get a personalized plan focused on daily stretching and movement health.
              </p>
              <p>
                These free programs guide you through every body stretch safely. They remind you to keep your back straight and breathe evenly. This regular stretching reduces lower back pain and improves athletic performance.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800" alt="Person using a free workout app on their phone at the gym" className="rounded-2xl mt-8 w-full h-48 object-cover filter brightness-95 group-hover:brightness-100 transition-all duration-500" />
          </motion.div>
        </section>

        {/* Section 3: Large Editorial Block - Full Width Image with overlapping text */}
        <section className="relative rounded-[3rem] overflow-hidden group">
          <div className="absolute inset-0 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop" alt="Woman doing a morning stretching routine near a window" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 saturate-50" />
             <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px]" />
          </div>
          <div className="relative z-10 px-8 py-20 md:p-24 md:w-2/3">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-6">
                 <div className="w-4 h-4 bg-gold rounded-full" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-cream tracking-tight mb-6">What should your daily stretching routine include?</h2>
              <div className="text-lg text-cream/80 space-y-6">
                <p>
                  Your daily stretching routine should target all the major muscle groups in your body. Focus heavily on your lower body and upper body alike. A complete full-body stretching routine builds balance and symmetry.
                </p>
                <p>
                  You can utilize full body stretch routines to awaken your nervous system. First, stand with your feet hip-width apart and reach your left arm up to shoulder height. Hold the stretch, then switch sides to feel a stretch evenly.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 4: Grid Layout */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-4xl font-bold text-charcoal mb-6">What are the key benefits of stretching?</h2>
            <div className="text-lg text-charcoal/70 space-y-6">
              <p>
                The benefits of stretching extend far beyond just feeling loose. Stretching regularly promotes improved flexibility and an increase in blood flow. A <a href="https://www.health.harvard.edu/staying-healthy/benefits-of-flexibility-exercises" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline transition-colors">Harvard Health — Benefits of flexibility exercises</a> report highlights its role in reducing the risk of injury.
              </p>
              <p>
                Daily stretching also calms the mind and relieves stress. You can reduce your risk of strains by ensuring your muscles are pliable. Maintaining a full range of motion prevents age-related stiffness and lower back pain.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200" alt="Person experiencing the calm and physical benefits of daily stretching" className="rounded-[2rem] shadow-xl mt-8 w-full h-[300px] object-cover hover:shadow-2xl transition-shadow translate-y-0 hover:-translate-y-2 duration-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl md:text-4xl font-bold text-charcoal mb-6">How do you perform a proper hamstring stretch?</h2>
            <div className="text-lg text-charcoal/70 space-y-6">
              <p>
                A proper hamstring stretch targets the back of your thigh. You can sit flat on the floor with one leg straight and the other bent. Lean forward with your back straight until you feel a stretch in your hamstring.
              </p>
              <p>
                The <a href="https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/hamstring-stretch/vid-20084683" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline transition-colors">Mayo Clinic — Hamstring stretch</a> demonstrates how to safely stretch this vital muscle group. Do not force the movement; securely hold the stretch for 30 seconds and repeat on the other side. This stretch greatly assists in reducing the risk of injury.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200" alt="A person sitting on a mat performing a proper hamstring stretch" className="rounded-[2rem] shadow-xl mt-8 w-full h-[300px] object-cover hover:shadow-2xl transition-shadow translate-y-0 hover:-translate-y-2 duration-500" />
          </motion.div>
        </section>

        {/* Section 5: Bento Specific Stretches */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.4 }} className="bg-cream/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow flex flex-col border border-charcoal/5">
              <h2 className="text-2xl font-bold text-charcoal mb-4">When should you do a calf stretch?</h2>
              <div className="text-charcoal/70 space-y-4">
                <p>
                  You should perform a calf stretch after any leg-heavy exercise or walking. An effective calf stretch requires you to stand near a wall. Place one foot forward and bend your front knee, keeping your back leg straight.
                </p>
                <p>
                  Make sure to keep your back heel flat on the floor and feet flat. Lean into the wall to deepen the stretch in your calf. You will feel a stretch run down your lower leg, which increases blood flow.
                </p>
              </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }} transition={{ delay: 0.1, duration: 0.4 }} className="bg-cream/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow flex flex-col border border-charcoal/5">
              <h2 className="text-2xl font-bold text-charcoal mb-4">Why are hip flexors important to stretch?</h2>
              <div className="text-charcoal/70 space-y-4">
                <p>
                  Your hip flexors easily become tight from sitting all day. A hip flexor stretch opens the front of your thigh and pelvis. It plays a critical role in alleviating back pain and improving your posture.
                </p>
                <p>
                  To do a hip flexor stretch, step your left leg forward into a lunge. Put your right knee on the floor and push your hips forward. Keep your back straight and hold the stretch for at least 20 seconds.
                </p>
              </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ scale: 1.03 }} transition={{ delay: 0.2, duration: 0.4 }} className="bg-cream/50 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow flex flex-col border border-charcoal/5">
              <h2 className="text-2xl font-bold text-charcoal mb-4">How can you stretch your upper back effectively?</h2>
              <div className="text-charcoal/70 space-y-4">
                <p>
                  An upper back stretch relieves tension between your shoulder blades. You can cross your left arm over your chest and pull it gently. This simple stretch provides immediate relief and helps increase flexibility.
                </p>
                <p>
                  Another great upper back stretch involves extending your arms out in front. Push your palms away and round your shoulders slightly. It is one of the best ways to stretch the upper body while sitting at a desk.
                </p>
              </div>
           </motion.div>
        </section>

        {/* Section 6: Editorial Bottom Banner */}
        <section className="relative rounded-[3rem] overflow-hidden bg-charcoal text-cream grid grid-cols-1 lg:grid-cols-2 items-center group">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-10 md:p-16 lg:p-20 order-2 lg:order-1">
             <div className="w-16 h-1 bg-gold mb-10" />
             <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">What does a full body stretch entail?</h2>
             <div className="text-lg text-cream/70 space-y-6">
                <p>
                  A full body stretch targets everything from your neck down to your calves. You will stretch your glutes, hamstring, thigh, and calf muscles. It thoroughly prepares the muscle groups in your body for intense exercise.
                </p>
                <p>
                  A <a href="https://pubmed.ncbi.nlm.nih.gov/22316148/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 underline transition-colors">PubMed review on static vs dynamic stretching</a> suggests mixing dynamic stretches before activities and static stretches after. You straighten your legs and stretch your arms high. This full-body stretching routine ensures your joints maintain optimal health and mobility.
                </p>
             </div>
          </motion.div>
          <div className="h-[300px] lg:h-full w-full order-1 lg:order-2 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop" alt="Athlete performing a dynamic full body stretch" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 filter grayscale contrast-125" />
          </div>
        </section>

      </div>
    </div>
  );
}
