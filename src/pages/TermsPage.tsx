import React from 'react';
import { Logo } from '../components/Logo';

export default function TermsPage() {
  return (
    <div className="bg-sand text-charcoal font-sans">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-serif font-medium mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-charcoal/80 leading-relaxed max-w-none prose">
          <p>
            Effective Date: May 3, 2026.
          </p>
          <p>
            Welcome to Stretching Program. By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-red-600">No Medical Advice Disclaimer</h2>
          <p>
            The information, including but not limited to, text, graphics, images, and other material contained on this website are for informational and educational purposes only. No material on this site is intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition or treatment and before undertaking a new healthcare regimen.
          </p>
          <p>
            Never disregard professional medical advice or delay in seeking it because of something you have read on this website. Our routines are generic and may not be suitable for people dealing with specific injuries, joint conditions, or pregnancies.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Use at Your Own Risk</h2>
          <p>
            You agree that your use of our features, routines, exercises, and content is entirely at your own risk. Stretching Program and its creators are not liable for any injuries, damages, or health issues arising from the usage of the stretching programs provided by this site. You acknowledge that physical exercise inherently carries a risk of injury, and you assume full responsibility for any and all injuries or damages you might suffer.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Intellectual Property</h2>
          <p>
            All content on this site, including text, graphics, logos, images, and software, is the property of Stretching Program or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works without explicit written permission.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Modifications to Terms</h2>
          <p>
            We may revise these Terms of Use for our website at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms and Conditions of Use. We encourage you to review this page periodically for any updates.
          </p>
        </div>
      </div>
    </div>
  );
}

