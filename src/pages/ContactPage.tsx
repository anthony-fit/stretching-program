import React from 'react';
import { Logo } from '../components/Logo';

export default function ContactPage() {
  return (
    <div className="bg-sand text-charcoal font-sans">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-serif font-medium mb-8">Contact Us</h1>
        
        <div className="space-y-6 text-charcoal/80 leading-relaxed max-w-none prose">
          <p>
            At Stretching Pro, we value our community of movement specialists and are always striving to improve our platform. Whether you have a question about the Studio, you're experiencing technical difficulties, or you have a specific request for the exercise systems, we would love to hear from you.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">How to Reach Us</h2>
          <p>
            For support, partnership inquiries, or general questions, the most efficient way to get in touch with our team is via email. We aim to respond to all inquiries within 1-2 business days. Please drop us a line at:
          </p>

          <p className="font-bold text-lg text-gold bg-cream p-4 rounded-lg inline-block border border-gold/20">
            hello@stretchingprogram.com
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Feedback and Suggestions</h2>
          <p>
            Is there a specific feature you'd like to see in the Studio? Different aspect ratios, new motion graphics, or specific exercise additions? Your feedback is incredibly important to us. Please don't hesitate to email us your thoughts.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Social Media Creators</h2>
          <p>
            If you are a large-scale automation channel or a content creator looking to integrate Stretching Pro into your workflow at scale, please reach out to discuss custom solutions and early access to new automation features.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Stay Connected</h2>
          <p>
            While email is best for direct inquiries, you can also stay up to date with our latest news by checking out our site regularly. As we continue to grow, we will be expanding into various social platforms, so stay tuned for new ways to connect and stretch together.
          </p>
        </div>
      </div>
    </div>
  );
}

