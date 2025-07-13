import React from 'react';
import { History, PlusCircle, Wrench, TrendingUp } from 'lucide-react';

const ChangelogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const changelogData = [
    {
      version: 'v1.2.1',
      date: 'Today',
      title: 'Component Isolation',
      description: 'The System Updates changelog has been isolated into its own reusable component file for portability.',
      type: 'improvement',
    },
    {
      version: 'v1.2.0',
      date: 'Yesterday',
      title: 'System Changelog Viewer',
      description: 'Added a transparency feature to view recent system updates and changes directly within the OS.',
      type: 'new',
    },
    {
      version: 'v1.1.0',
      date: '2 days ago',
      title: 'Security Policy Integration',
      description: 'Integrated an interactive PDF viewer to display the C42 OS Security Policy, enhancing transparency.',
      type: 'new',
    },
    {
      version: 'v1.0.1',
      date: '2 days ago',
      title: 'Performance Optimization',
      description: 'Resolved a critical re-rendering issue that caused the UI to lock up. The system is now significantly more responsive.',
      type: 'fix',
    },
  ];

  const typeStyles = {
    new: { icon: <PlusCircle className="w-5 h-5" />, color: 'text-c42-accent', bg: 'bg-green-100 dark:bg-green-900/20' },
    fix: { icon: <Wrench className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
    improvement: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-c42-secondary', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-c42-dark-card rounded-xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary flex items-center gap-3">
            <History className="w-6 h-6 text-c42-primary" />
            System Updates & Changelog
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close changelog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          <ul className="space-y-6">
            {changelogData.map((entry, index) => {
                const style = typeStyles[entry.type] || {};
                return (
                  <li key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full ${style.bg} ${style.color}`}>
                        {style.icon}
                      </span>
                      {index < changelogData.length - 1 && (
                        <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-4"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</p>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary">{entry.title}</h4>
                      <p className="text-gray-600 dark:text-c42-text-dark-secondary mt-1">{entry.description}</p>
                    </div>
                  </li>
                );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
