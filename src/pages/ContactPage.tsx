import React from 'react';
import { Logo } from '../components/Logo';

export default function ContactPage() {
  return (
    <div className="bg-sand text-charcoal font-sans">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-serif font-medium mb-8">Contact Us</h1>
        
        <div className="space-y-6 text-charcoal/80 leading-relaxed max-w-none prose">
          <p>
            At Stretching Program, we value our community of users and are always striving to improve our platform. Whether you have a question about a specific routine, you're experiencing technical difficulties, or you simply want to share a success story about how stretching has improved your daily life, we would love to hear from you.
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
            Is there a specific muscle group you feel we haven't covered well enough? Do you have an idea for a new feature, like longer hold times or different aesthetic themes? Your feedback is incredibly important to us. It helps dictate the direction of our future updates. Please don't hesitate to email us your thoughts, no matter how small.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Business & Partnerships</h2>
          <p>
            If you represent a brand, publication, or health initiative and are interested in partnering with Stretching Program, please include "PARTNERSHIP" in the subject line of your email. We are open to discussing content syndication, corporate wellness programs, and other collaborative opportunities that align with our mission of making effective stretching accessible to everyone.
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

