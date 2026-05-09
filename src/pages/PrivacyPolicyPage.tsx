import React from 'react';
import { Logo } from '../components/Logo';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-sand text-charcoal font-sans">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-serif font-medium mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-charcoal/80 leading-relaxed max-w-none prose">
          <p>
            Effective Date: May 3, 2026.
          </p>
          <p>
            This Privacy Policy describes how Stretching Program ("we", "us", or "our") collects, uses, protects, and handles your personal information when you visit and interact with our website. We are committed to protecting your privacy and ensuring you have a safe online experience. By using our Site, you consent to the data practices described in this statement.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Information We Collect</h2>
          <p>
            When you visit the Site, we may collect certain information automatically from your device, including details about your web browser, IP address, time zone, and some of the cookies that are installed on your device. As you browse the Site, we collect information about the individual web pages or exercises that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Analytics & Cookies</h2>
          <p>
            We use Google Analytics and other similar tools to help us understand how our visitors use the Site. These tools use cookies—small data files placed on your device—to collect standard Internet log information and visitor behavior information in an anonymous form. This information is used to evaluate visitors' use of the website and to compile statistical reports on website activity. You can choose to disable cookies through your individual browser options.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Third-Party Advertising</h2>
          <p>
            We use third-party advertising companies, such as Google AdSense and Ezoic, to serve ads when you visit our website. These companies may use aggregated information (not including your name, address, email address, or telephone number) about your visits to this and other Web sites in order to provide advertisements about goods and services of interest to you. This is often done using tracking cookies.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">How We Use Your Information</h2>
          <p>
            We use the information we collect to maintain and improve our Site, fulfill any user requests, monitor and analyze trends and usage, and personalize the Site for you. We might also use your information to communicate with you, provided you have opted into such communications.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Your Rights</h2>
          <p>
            If you are a European resident, under the General Data Protection Regulation (GDPR), you have the right to access the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information provided on our Contact page. Similarly, California residents have rights under the CCPA to request information about our data collection practices.
          </p>
        </div>
      </div>
    </div>
  );
}

