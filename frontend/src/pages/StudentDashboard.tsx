import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

interface Achievement {
    id: number;
    title: string;
    description: string;
    category: string;
    date_achieved: string | null;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    created_at: string;
}

interface PortfolioData {
    student_name: string;
    department: string | null;
    program: string | null;
    enrollment_year: number | null;
    gpa: string | null;
    achievements: Achievement[];
    is_public: boolean;
    share_token: string | null;
}

const StudentDashboard = () => {
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0
    });

    // Add Achievement State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAchievement, setNewAchievement] = useState({
        title: '',
        description: '',
        category: 'OTHER',
        date_achieved: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Share Portfolio State
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    // View All Achievements State
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/api/portfolio/me');
            const data: PortfolioData = response.data;
            setPortfolio(data);

            const total = data.achievements.length;
            const verified = data.achievements.filter(a => a.status === 'VERIFIED').length;
            const pending = data.achievements.filter(a => a.status === 'PENDING').length;

            setStats({ total, verified, pending });
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newAchievement,
                date_achieved: newAchievement.date_achieved
                    ? new Date(newAchievement.date_achieved).toISOString()
                    : null
            };
            await api.post('/api/portfolio/achievements', payload);
            setIsModalOpen(false);
            setNewAchievement({ title: '', description: '', category: 'OTHER', date_achieved: new Date().toISOString().split('T')[0] });
            fetchDashboardData();
        } catch (error) {
            console.error("Failed to add achievement", error);
            alert("Failed to add achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        try {
            const response = await api.post('/api/portfolio/share');
            const token = response.data.share_token;
            const url = `${window.location.origin}/p/${token}`;
            setShareUrl(url);
            if (portfolio) {
                setPortfolio({ ...portfolio, is_public: true, share_token: token });
            }
        } catch (error) {
            console.error("Failed to share portfolio", error);
            alert("Failed to create share link");
        }
    };

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <div className={`w-64 border-r hidden md:block ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-6">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-primary-600'}`}>EduZo</h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link to="/dashboard" className={`block px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-primary-50 text-primary-700'}`}>Dashboard</Link>
                    <Link to="/profile" className={`block px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>My Profile</Link>
                    <Link to="/chat" className={`block px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>AI Assistant</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
                <header className={`shadow-sm px-8 py-4 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h2>
                        {portfolio && (
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {portfolio.department && portfolio.program && `${portfolio.department} • ${portfolio.program}`}
                                {portfolio.enrollment_year && ` • Year ${new Date().getFullYear() - portfolio.enrollment_year + 1}`}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                        <Button variant="outline" onClick={handleShare} className="text-sm">
                            {portfolio?.is_public ? 'View Share Link' : 'Share Portfolio'}
                        </Button>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Welcome, {portfolio?.student_name || 'Student'}</span>
                        <Button variant="secondary" onClick={logout} className="text-sm">Logout</Button>
                    </div>
                </header>

                <main className="p-8">
                    {loading ? (
                        <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Achievements</h3>
                                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                                </div>
                                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Verified</h3>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.verified}</p>
                                </div>
                                <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Review</h3>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                                </div>
                                {portfolio?.gpa && (
                                    <div className={`p-6 rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>GPA</h3>
                                        <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-blue-400' : 'text-primary-600'}`}>{portfolio.gpa}</p>
                                    </div>
                                )}
                            </div>

                            <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activity</h3>
                                    <div className="flex gap-2">
                                        <Button onClick={() => setIsModalOpen(true)} className="text-xs">Add Achievement</Button>
                                        <Button variant="outline" className="text-xs" onClick={() => setIsViewAllOpen(true)}>View All</Button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {portfolio && portfolio.achievements.length > 0 ? (
                                        <div className="space-y-4">
                                            {portfolio.achievements.slice(0, 5).map((achievement) => (
                                                <div key={achievement.id} className={`flex justify-between items-start border-b pb-3 last:border-0 last:pb-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievement.title}</p>
                                                            {achievement.category && (
                                                                <span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-primary-50 text-primary-700'}`}>
                                                                    {achievement.category.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`flex items-center gap-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {achievement.date_achieved && (
                                                                <span>📅 {new Date(achievement.date_achieved).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${achievement.status === 'VERIFIED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                        achievement.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                        }`}>
                                                        {achievement.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No recent activity found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </main>

                {/* Add Achievement Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`p-6 rounded-xl shadow-xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Achievement</h3>
                            <form onSubmit={handleAddAchievement}>
                                <Input
                                    label="Title"
                                    value={newAchievement.title}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                    required
                                    placeholder="e.g. Completed Python Course"
                                />
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                                    <select
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        value={newAchievement.category}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })}
                                        required
                                    >
                                        <option value="ACADEMIC">Academic</option>
                                        <option value="EXTRACURRICULAR">Extracurricular</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="CULTURAL">Cultural</option>
                                        <option value="TECHNICAL">Technical</option>
                                        <option value="RESEARCH">Research</option>
                                        <option value="COMMUNITY_SERVICE">Community Service</option>
                                        <option value="LEADERSHIP">Leadership</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date Achieved</label>
                                    <input
                                        type="date"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        value={newAchievement.date_achieved}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, date_achieved: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                                    <textarea
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        rows={3}
                                        value={newAchievement.description}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                                        required
                                        placeholder="Describe your achievement..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" isLoading={isSubmitting}>Submit</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Share Portfolio Modal */}
                {shareUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`p-6 rounded-xl shadow-xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Share Your Portfolio</h3>
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Anyone with this link can view your verified achievements.</p>
                            <div className="flex gap-2 mb-4">
                                <Input value={shareUrl} readOnly className="flex-1" />
                                <Button onClick={copyToClipboard}>Copy</Button>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => setShareUrl(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View All Achievements Modal */}
                {isViewAllOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    All Achievements ({portfolio?.achievements.length || 0})
                                </h3>
                                <Button variant="secondary" onClick={() => setIsViewAllOpen(false)}>Close</Button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                {portfolio && portfolio.achievements.length > 0 ? (
                                    <div className="space-y-4">
                                        {portfolio.achievements.map((achievement) => (
                                            <div key={achievement.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievement.title}</h4>
                                                            {achievement.category && (
                                                                <span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-primary-50 text-primary-700'}`}>
                                                                    {achievement.category.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{achievement.description}</p>
                                                        <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {achievement.date_achieved && (
                                                                <span>📅 Achieved: {new Date(achievement.date_achieved).toLocaleDateString()}</span>
                                                            )}
                                                            <span>📝 Added: {new Date(achievement.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${achievement.status === 'VERIFIED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                            achievement.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                        }`}>
                                                        {achievement.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No achievements yet. Add your first achievement!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
