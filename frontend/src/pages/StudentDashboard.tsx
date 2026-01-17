import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
        date_achieved: new Date().toISOString().split('T')[0]  // YYYY-MM-DD
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Share Portfolio State
    const [shareUrl, setShareUrl] = useState<string | null>(null);

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
            await api.post('/api/portfolio/achievements', newAchievement);
            setIsModalOpen(false);
            setNewAchievement({ title: '', description: '', category: 'OTHER', date_achieved: new Date().toISOString().split('T')[0] });
            fetchDashboardData(); // Refresh data
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
            // Use window.location.origin to parse the current host
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary-600">EduZo</h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link to="/dashboard" className="block px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium">Dashboard</Link>
                    <Link to="/portfolio" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50">My Portfolio</Link>
                    <Link to="/chat" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50">AI Assistant</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                        {portfolio && (
                            <p className="text-sm text-gray-500 mt-1">
                                {portfolio.department && portfolio.program && `${portfolio.department} • ${portfolio.program}`}
                                {portfolio.enrollment_year && ` • Year ${new Date().getFullYear() - portfolio.enrollment_year + 1}`}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={handleShare} className="text-sm">
                            {portfolio?.is_public ? 'View Share Link' : 'Share Portfolio'}
                        </Button>
                        <span className="text-gray-600">Welcome, {portfolio?.student_name || 'Student'}</span>
                        <Button variant="secondary" onClick={logout} className="text-sm">Logout</Button>
                    </div>
                </header>

                <main className="p-8">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Total Achievements</h3>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Verified</h3>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.verified}</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                                </div>
                                {portfolio?.gpa && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="text-gray-500 text-sm font-medium">GPA</h3>
                                        <p className="text-3xl font-bold text-primary-600 mt-2">{portfolio.gpa}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                                    <div className="flex gap-2">
                                        <Button onClick={() => setIsModalOpen(true)} className="text-xs">Add Achievement</Button>
                                        <Button variant="outline" className="text-xs">View All</Button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {portfolio && portfolio.achievements.length > 0 ? (
                                        <div className="space-y-4">
                                            {portfolio.achievements.slice(0, 5).map((achievement) => (
                                                <div key={achievement.id} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-medium text-gray-900">{achievement.title}</p>
                                                            {achievement.category && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-700">
                                                                    {achievement.category.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            {achievement.date_achieved && (
                                                                <span>📅 {new Date(achievement.date_achieved).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${achievement.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                                        achievement.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {achievement.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
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
                        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Add Achievement</h3>
                            <form onSubmit={handleAddAchievement}>
                                <Input
                                    label="Title"
                                    value={newAchievement.title}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                    required
                                    placeholder="e.g. Completed Python Course"
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Achieved</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        value={newAchievement.date_achieved}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, date_achieved: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Share Your Portfolio</h3>
                            <p className="text-sm text-gray-600 mb-4">Anyone with this link can view your verified achievements.</p>
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
            </div>
        </div>
    );
};

export default StudentDashboard;
