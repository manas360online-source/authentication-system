import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuditLog, Session } from '../types';
import { authService } from '../services/mockBackend';
import { analyzeSecurityLogs } from '../services/geminiService';
import { Card, Button, Badge } from '../components/ui';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [togglingMfa, setTogglingMfa] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');

    if (!storedUser || !token) {
      navigate('/');
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    setUser(parsedUser);

    // Load data
    authService.getAuditLogs(parsedUser.id).then(setLogs);
    authService.getSessions(parsedUser.id).then(setSessions);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    navigate('/');
  };

  const handleToggleMfa = async () => {
    if (!user) return;
    setTogglingMfa(true);
    const newState = !user.mfaEnabled;
    await authService.toggleMfa(user.id, newState);
    
    // Update local state
    const updatedUser = { ...user, mfaEnabled: newState };
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    
    // Refresh logs
    authService.getAuditLogs(user.id).then(setLogs);
    setTogglingMfa(false);
  };

  const generateAiReport = async () => {
    if (!logs.length) return;
    setLoadingAi(true);
    const report = await analyzeSecurityLogs(logs);
    setAiInsight(report);
    setLoadingAi(false);
  };

  if (!user) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 text-blue-600 text-xl font-bold">
              <i className="fa-solid fa-shield-halved"></i>
              <span>SecureGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {user.fullName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.fullName}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-sm">
                <i className="fa-solid fa-right-from-bracket mr-2"></i>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Security Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your account security and view activity.</p>
          </div>
          <div className="mt-4 md:mt-0">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user.isVerified ? 'Verified Account' : 'Verification Pending'}
             </span>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">MFA Status</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</h3>
                        <p className="mt-1 text-xs text-slate-400">Two-factor authentication</p>
                    </div>
                    <div className={`p-2 rounded-lg ${user.mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <i className="fa-solid fa-mobile-screen-button text-xl"></i>
                    </div>
                </div>
                <div className="mt-4">
                    <Button variant={user.mfaEnabled ? 'secondary' : 'primary'} size="sm" className="w-full text-xs" onClick={handleToggleMfa} isLoading={togglingMfa}>
                        {user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                    </Button>
                </div>
            </Card>

             <Card className="border-l-4 border-l-purple-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{sessions.length} Devices</h3>
                         <p className="mt-1 text-xs text-slate-400">Currently logged in</p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <i className="fa-solid fa-laptop text-xl"></i>
                    </div>
                </div>
                 <div className="mt-4">
                     <Button variant="ghost" className="w-full text-xs border border-slate-200">Manage Devices</Button>
                 </div>
            </Card>

             <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">AI Security Scan</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">Analysis Tool</h3>
                        <p className="mt-1 text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
                    </div>
                     <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <i className="fa-solid fa-robot text-xl"></i>
                    </div>
                </div>
                <div className="mt-4">
                    <Button variant="outline" className="w-full text-xs" onClick={generateAiReport} isLoading={loadingAi} disabled={!process.env.API_KEY}>
                        <i className="fa-solid fa-wand-magic-sparkles mr-1 text-orange-500"></i> Generate Report
                    </Button>
                </div>
            </Card>
        </div>

        {/* AI Insight Section */}
        {aiInsight && (
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                    <i className="fa-solid fa-user-secret text-blue-600"></i>
                    Security Analyst Insight
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {aiInsight}
                </p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Audit Logs */}
            <div className="lg:col-span-2">
                <Card title="Recent Activity (Audit Log)">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP Address</th>
                                    <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {log.event.replace('_', ' ')}
                                            {log.details && <div className="text-xs text-slate-400 font-normal">{log.details}</div>}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                                            <Badge type={log.status === 'success' ? 'success' : log.status === 'failure' ? 'danger' : 'warning'}>
                                                {log.status}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500 font-mono text-xs">{log.ip}</td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">No logs available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Sessions */}
            <div className="lg:col-span-1">
                 <Card title="Active Sessions">
                    <ul className="space-y-4">
                        {sessions.map(session => (
                            <li key={session.id} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <i className={`fa-solid ${session.device.toLowerCase().includes('phone') ? 'fa-mobile-screen' : 'fa-laptop'}`}></i>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{session.device}</p>
                                    <p className="text-xs text-slate-500 truncate">{session.location} • {session.ip}</p>
                                    <p className="text-xs text-slate-400 mt-1">{session.lastActive}</p>
                                </div>
                                {session.isCurrent && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Current
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                 </Card>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;