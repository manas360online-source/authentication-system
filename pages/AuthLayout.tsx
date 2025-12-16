import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle: string }> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[480px] bg-white border-r border-slate-200">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
             <div className="flex items-center gap-2 text-blue-600 text-2xl font-bold mb-2">
                <i className="fa-solid fa-shield-halved"></i>
                <span>SecureGuard</span>
             </div>
             <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
             <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2024 SecureGuard Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:block relative flex-1 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
            <div className="max-w-lg">
                <h3 className="text-4xl font-bold mb-6">Enterprise-Grade Security</h3>
                <ul className="space-y-4 text-lg text-slate-300">
                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-green-400"></i> Advanced Encryption Standard</li>
                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-green-400"></i> Multi-Factor Authentication</li>
                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-green-400"></i> Real-time Threat Monitoring</li>
                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-green-400"></i> Detailed Audit Logs</li>
                </ul>
            </div>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      </div>
    </div>
  );
};