import React from 'react';
import { Shield, Mail, ShieldCheck, Zap, Globe, Map, CheckCircle, Construction, Award } from 'lucide-react';

const SecurityPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-c42-dark-card rounded-xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary flex items-center gap-3">
            <Shield className="w-6 h-6 text-c42-primary" />
            Security Policy
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close security policy"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto space-y-8 text-gray-600 dark:text-c42-text-dark-secondary">
          
          {/* Supported Versions */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-c42-accent" /> Supported Versions
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Version</th>
                    <th className="p-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Supported</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white dark:bg-c42-dark-card">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono">1.0.x</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-c42-accent font-semibold">✔ Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Reporting a Vulnerability */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" /> Reporting a Vulnerability
            </h4>
            <p className="mb-4">
              We take security seriously. If you discover a security vulnerability, please follow responsible disclosure:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200"><Mail className="w-4 h-4 text-c42-primary" /> Security Contact</h5>
                <p className="text-sm">Email: <a href="mailto:security@c42os.com" className="text-c42-primary hover:underline">security@c42os.com</a></p>
                <p className="text-sm">Response Time: Within 24 hours</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200"><Award className="w-4 h-4 text-c42-accent" /> Recognition</h5>
                <p className="text-sm">Researchers who help improve C42 OS will be credited and invited to collaborate.</p>
              </div>
            </div>
          </section>

          {/* Security Features */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-c42-secondary" /> Security Features
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Built-in Privacy</h5>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>Zero external connections</li>
                  <li>Local processing only</li>
                  <li>Real-time network monitoring</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Transparency by Design</h5>
                <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>Open source code for audit</li>
                  <li>No obfuscated dependencies</li>
                  <li>User-runnable privacy audits</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Neurodivergent-Safe</h5>
                <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>Predictable interactions</li>
                  <li>Clear visual hierarchy</li>
                  <li>User control over features</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security Roadmap */}
          <section>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-3 flex items-center gap-2">
              <Map className="w-5 h-5 text-gray-500" /> Security Roadmap
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-green-700 dark:text-green-300">Current (Checkpoint 1)</h5>
                  <p className="text-sm">Local-only processing, network monitoring, privacy verification tools, and transparent source code.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                  <Construction className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-orange-600 dark:text-orange-400">Next (Checkpoint 2)</h5>
                  <p className="text-sm">End-to-end encryption, formal third-party audit, automated security testing, and a bug bounty program.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-purple-700 dark:text-purple-300">Future</h5>
                  <p className="text-sm">Security certifications, open standards contributions, and a community security review program.</p>
                </div>
              </div>
            </div>
          </section>

          <footer className="text-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="italic text-sm text-gray-500 dark:text-gray-400">Security through transparency, not obscurity.</p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default SecurityPolicyModal;