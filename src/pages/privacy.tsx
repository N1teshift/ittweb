import React from 'react';
import { PageHero, ErrorBoundary } from '@/features/infrastructure/components';

export default function PrivacyPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6 md:p-8 space-y-6 text-gray-300">
          <div className="text-sm text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              This Privacy Policy explains how we collect, use, and protect your personal information when you use our website. 
              We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="mb-4">When you log in to our website using Discord, we collect the following information:</p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Discord ID:</strong> Your unique Discord user identifier</li>
              <li><strong className="text-white">Email Address:</strong> Your Discord email address (if available)</li>
              <li><strong className="text-white">Name:</strong> Your Discord display name</li>
              <li><strong className="text-white">Username:</strong> Your Discord username</li>
              <li><strong className="text-white">Global Name:</strong> Your Discord global name</li>
              <li><strong className="text-white">Display Name:</strong> Your Discord display name</li>
              <li><strong className="text-white">Preferred Name:</strong> Your server-specific nickname (if available)</li>
              <li><strong className="text-white">Avatar URL:</strong> Link to your Discord profile picture</li>
              <li><strong className="text-white">Account Timestamps:</strong> When your account was created, last updated, and last login time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>To provide and maintain our website services</li>
              <li>To authenticate and manage your account</li>
              <li>To personalize your experience on our website</li>
              <li>To display your profile information (name, avatar) throughout the website</li>
              <li>To manage user roles and permissions</li>
              <li>To track account activity and login history</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Legal Basis:</strong> We process your personal data based on your consent when you log in using Discord, 
              and for the performance of our service contract with you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage</h2>
            <p className="mb-4">
              Your personal information is stored securely in Firebase Firestore, a cloud database service provided by Google. 
              Data is stored in the European Union or in compliance with GDPR requirements. We implement appropriate technical 
              and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as your account is active or as needed to provide you with our services. 
              If you delete your account, we will delete your personal data within 30 days, except where we are required to retain 
              certain information for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="mb-4">Under GDPR, you have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Right of Access:</strong> You can request a copy of all personal data we hold about you. You can view your data in the Settings page.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You can request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You can request deletion of your personal data (right to be forgotten).</li>
              <li><strong className="text-white">Right to Restrict Processing:</strong> You can request that we limit how we use your data.</li>
              <li><strong className="text-white">Right to Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format.</li>
              <li><strong className="text-white">Right to Object:</strong> You can object to processing of your personal data.</li>
              <li><strong className="text-white">Right to Withdraw Consent:</strong> You can withdraw your consent at any time by deleting your account.</li>
            </ul>
            <p className="mb-4">
              To exercise any of these rights, please contact us using the information provided in the Contact section below, 
              or use the account deletion feature in your Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Services</h2>
            <p className="mb-4">
              We use the following third-party services that may process your data:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Discord:</strong> We use Discord OAuth for authentication. When you log in, Discord provides us with your profile information. Please review Discord&apos;s privacy policy for information about how they handle your data.</li>
              <li><strong className="text-white">Firebase (Google):</strong> We use Firebase Firestore to store your data. Google processes this data in compliance with GDPR. Please review Google&apos;s privacy policy for more information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
            <p className="mb-4">
              We use session cookies to maintain your login session. These are essential cookies required for the website to function 
              and do not require your consent under GDPR. We do not use tracking cookies or analytics cookies without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our website is not intended for children under the age of 16. We do not knowingly collect personal information from children 
              under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us 
              so we can delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <ul className="list-none mb-4 space-y-2 ml-4">
              <li>Email: [Your contact email]</li>
              <li>Website: [Your website contact form or Discord server]</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Note:</strong> Please replace the contact information above with your actual contact details.
            </p>
          </section>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}


