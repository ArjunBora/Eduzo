import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface Achievement {
    id: number;
    title: string;
    description: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    created_at: string;
}

interface PortfolioData {
    student_name: string;
    achievements: Achievement[];
    is_public: boolean;
    share_token: string;
}

const PublicPortfolio = () => {
    const { token } = useParams<{ token: string }>();
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await api.get(`/api/portfolio/public/${token}`);
                setPortfolio(response.data);
            } catch (err) {
                console.error("Failed to load portfolio", err);
                setError("Portfolio not found or private.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPortfolio();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading portfolio...</p>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
                    <p className="text-gray-600">{error || "Something went wrong"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <header className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{portfolio.student_name}'s Portfolio</h1>
                    <p className="text-gray-500 mt-2">Verified Academic Achievements</p>
                </header>

                <div className="space-y-6">
                    {portfolio.achievements.length > 0 ? (
                        portfolio.achievements.map((achievement) => (
                            <div key={achievement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{achievement.title}</h3>
                                        <p className="text-gray-600 mt-2">{achievement.description}</p>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        VERIFIED
                                    </span>
                                </div>
                                <div className="mt-4 text-xs text-gray-400">
                                    Issued on {new Date(achievement.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500">No verified achievements to display yet.</p>
                        </div>
                    )}
                </div>

                <footer className="mt-12 text-center text-sm text-gray-500">
                    <p>Powered by EduZo</p>
                </footer>
            </div>
        </div>
    );
};

export default PublicPortfolio;
