import { useEffect, useState } from 'react';
import {
    Search,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Download
} from 'lucide-react';
import { setBreadcrumbs } from '../../store/slice/uiSlice';
import { useAppDispatch } from '../../hooks/hooks';

const DUMMY_AUDIT_LOGS = [
    {
        id: 1,
        action: "Approved vendor 'CleanPro Services'",
        severity: 'INFO',
        user: 'Super Admin',
        email: 'admin@poshstay.com',
        category: 'Vendors',
        ip: '192.168.1.1',
        timestamp: '2026-06-26 14:32:18'
    },
    {
        id: 2,
        action: "Modified booking BK-9238 — changed dates",
        severity: 'INFO',
        user: 'Priya Sharma',
        email: 'priya.s@poshstay.com',
        category: 'Booking',
        ip: '10.0.0.45',
        timestamp: '2026-06-26 13:15:42'
    },
    {
        id: 3,
        action: "Detected 5 failed login attempts for user deepika@email.com",
        severity: 'WARNING',
        user: 'System',
        email: 'system@poshstay.com',
        category: 'Security',
        ip: '280.0.0.113',
        timestamp: '2026-06-26 12:08:55'
    },
    {
        id: 4,
        action: "Processed refund ₹8,200 for booking BK-9237",
        severity: 'INFO',
        user: 'Finance Manager',
        email: 'finance@poshstay.com',
        category: 'Payments',
        ip: '10.0.0.12',
        timestamp: '2026-06-26 11:45:33'
    },
    {
        id: 5,
        action: "Deleted property listing 'Bay Retreat Kochi'",
        severity: 'CRITICAL',
        user: 'Platform Admin',
        email: 'admin@poshstay.com',
        category: 'Properties',
        ip: '10.0.0.8',
        timestamp: '2026-06-26 10:20:14'
    },
    {
        id: 6,
        action: "Updated role permissions for 'Finance Manager'",
        severity: 'WARNING',
        user: 'Super Admin',
        email: 'admin@poshstay.com',
        category: 'Roles',
        ip: '192.168.1.1',
        timestamp: '2026-06-26 09:55:07'
    },
    {
        id: 7,
        action: "Logged in successfully",
        severity: 'INFO',
        user: 'Rahul Admin',
        email: 'rahul.admin@poshstay.com',
        category: 'Auth',
        ip: '10.0.0.22',
        timestamp: '2026-06-26 09:12:41'
    },
    {
        id: 8,
        action: "Automated payout processed — ₹12,400 to SwiftFix",
        severity: 'INFO',
        user: 'System',
        email: 'system@poshstay.com',
        category: 'Payments',
        ip: '10.0.0.0',
        timestamp: '2026-06-26 08:30:22'
    },
    {
        id: 9,
        action: "Suspended user account arjun@email.com",
        severity: 'WARNING',
        user: 'Support Agent',
        email: 'support@poshstay.com',
        category: 'Users',
        ip: '10.0.0.31',
        timestamp: '2026-06-25 17:45:09'
    },
    {
        id: 10,
        action: "Exported full user data report",
        severity: 'INFO',
        user: 'Super Admin',
        email: 'admin@poshstay.com',
        category: 'Reports',
        ip: '192.168.1.1',
        timestamp: '2026-06-25 16:20:38'
    }
];

const severityColors = {
    INFO: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
    WARNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
    CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30',
    SUCCESS: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
};

const severityIcons = {
    INFO: Info,
    WARNING: AlertTriangle,
    CRITICAL: AlertCircle,
    SUCCESS: CheckCircle,
};

export default function AuditLogs() {
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState('All');

    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: 'System', path: '/system' },
            { label: 'Audit Logs' }
        ]));
    }, [dispatch]);

    const filteredLogs = DUMMY_AUDIT_LOGS.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;
        return matchesSearch && matchesSeverity;
    });

    const severityCounts = DUMMY_AUDIT_LOGS.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6" id="audit-logs-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Audit Logs
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        System activity monitoring and security audit trail
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Download className="w-4 h-4" />
                    Export Logs
                </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'INFO', 'WARNING', 'CRITICAL'].map((severity) => (
                        <button
                            key={severity}
                            onClick={() => setSelectedSeverity(severity)}
                            className={`px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium transition-colors ${selectedSeverity === severity
                                ? 'bg-black text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {severity}
                            {severity !== 'All' && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/20 text-xs">
                                    {severityCounts[severity] || 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLogs.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <p className="text-sm">No logs found matching your filters</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const SeverityIcon = severityIcons[log.severity as keyof typeof severityIcons] || Info;
                            const severityColor = severityColors[log.severity as keyof typeof severityColors] || severityColors.INFO;

                            return (
                                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-20 px-2 py-1 rounded-md border text-[10px] font-bold text-center ${severityColor}`}>
                                            {log.severity}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {log.action}
                                                </p>
                                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                                    {log.timestamp}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{log.user}</span>
                                                    <span className="text-slate-400">-</span>
                                                    <span>{log.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">
                                                        {log.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                                                    <span>TP: {log.ip}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <SeverityIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${log.severity === 'INFO' ? 'text-blue-500' :
                                            log.severity === 'WARNING' ? 'text-amber-500' :
                                                log.severity === 'CRITICAL' ? 'text-red-500' :
                                                    'text-emerald-500'
                                            }`} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Showing {filteredLogs.length} of {DUMMY_AUDIT_LOGS.length} entries</span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        INFO ({severityCounts.INFO || 0})
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        WARNING ({severityCounts.WARNING || 0})
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        CRITICAL ({severityCounts.CRITICAL || 0})
                    </span>
                </div>
            </div>
        </div>
    );
}