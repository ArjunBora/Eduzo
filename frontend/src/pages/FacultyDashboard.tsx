import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';

interface Achievement {
    id: number;
    title: string;
    description: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    created_at: string;
    student_id: number;
    student_name: string;
}

const FacultyDashboard = () => {
    const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [achievementsRes, analyticsRes] = await Promise.all([
                api.get('/api/portfolio/achievements/pending'),
                api.get('/api/portfolio/analytics')
            ]);
            setPendingAchievements(achievementsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await api.put(`/api/portfolio/achievements/${id}/verify`, { status });
            // Refresh list
            fetchData();
        } catch (error) {
            console.error("Failed to verify achievement", error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                    <p className="text-gray-600">Overview of student activities and platform usage.</p>
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total Achievements</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.total_achievements || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Verified</p>
                        <p className="text-2xl font-bold text-green-600">{analytics?.verified_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-600">{analytics?.pending_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-primary-600">{analytics?.total_students || 0}</p>
                    </div>
                </div>

                {/* Category Breakdown */}
                {analytics?.category_breakdown && Object.keys(analytics.category_breakdown).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievement Categories</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(analytics.category_breakdown).map(([category, count]: [string, any]) => (
                                <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary-600">{count}</p>
                                    <p className="text-xs text-gray-600 mt-1">{category?.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Pending Achievement Requests</h2>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {pendingAchievements.length} Pending
                        </span>
                    </div>

                    {pendingAchievements.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No pending achievements to verify.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {pendingAchievements.map((achievement) => (
                                <div key={achievement.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                                                <span className="text-sm text-gray-500">by {achievement.student_name}</span>
                                            </div>
                                            <p className="text-gray-600">{achievement.description}</p>
                                            <p className="text-xs text-gray-400">Submitted on {new Date(achievement.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Button
                                                variant="outline"
                                                className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                                onClick={() => handleVerify(achievement.id, 'REJECTED')}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                className="!bg-green-600 hover:!bg-green-700"
                                                onClick={() => handleVerify(achievement.id, 'VERIFIED')}
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FacultyDashboard;
