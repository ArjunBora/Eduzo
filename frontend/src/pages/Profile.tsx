import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

interface ProfileData {
    student_name: string;
    email: string;
    enrollment_no: string;
    department: string | null;
    program: string | null;
    enrollment_year: number | null;
    gpa: string | null;
    phone_number: string | null;
    date_of_birth: string | null;
    age: number | null;
    bio: string | null;
}

const Profile = () => {
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [editData, setEditData] = useState({
        phone_number: '',
        date_of_birth: '',
        bio: '',
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/portfolio/me');
            setProfile(response.data);
            setEditData({
                phone_number: response.data.phone_number || '',
                date_of_birth: response.data.date_of_birth
                    ? new Date(response.data.date_of_birth).toISOString().split('T')[0]
                    : '',
                bio: response.data.bio || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAge = (dob: string): number | null => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            const payload = {
                phone_number: editData.phone_number || null,
                date_of_birth: editData.date_of_birth || null,
                bio: editData.bio || null,
            };
            await api.put('/api/portfolio/profile', payload);
            await fetchProfile();
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <div className={`w-64 border-r hidden md:block ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-6">
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-primary-600'}`}>EduZo</h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link to="/dashboard" className={`block px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</Link>
                    <Link to="/profile" className={`block px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-primary-50 text-primary-700'}`}>My Profile</Link>
                    <Link to="/chat" className={`block px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}>AI Assistant</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <header className={`shadow-sm px-8 py-4 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Profile</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Manage your personal information
                        </p>
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
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                            {profile?.student_name || 'Student'}
                        </span>
                        <Button variant="secondary" onClick={logout} className="text-sm">Logout</Button>
                    </div>
                </header>

                <main className="p-8">
                    {loading ? (
                        <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
                    ) : profile ? (
                        <div className="max-w-4xl mx-auto">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                                    {successMessage}
                                </div>
                            )}

                            {/* Profile Header Card */}
                            <div className={`rounded-xl shadow-sm border p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center space-x-6">
                                    {/* Avatar */}
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-primary-100 text-primary-600'}`}>
                                        {getInitials(profile.student_name)}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.student_name}</h3>
                                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{profile.email}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-primary-100 text-primary-700'}`}>
                                                {profile.program || 'Student'}
                                            </span>
                                            {editData.date_of_birth && (
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Age: {calculateAge(editData.date_of_birth)} years
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Read-only Registration Info */}
                                <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Registration Information
                                    </h4>
                                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        This information was set during registration and cannot be changed.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                                            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                {profile.student_name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                {profile.email}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enrollment No</label>
                                            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                {profile.enrollment_no || 'Not set'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department</label>
                                                <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                    {profile.department || 'Not set'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Program</label>
                                                <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                    {profile.program || 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enrollment Year</label>
                                            <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                {profile.enrollment_year || 'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Profile Info */}
                                <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Personal Information
                                    </h4>
                                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Update your personal details below.
                                    </p>
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={editData.phone_number}
                                                onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date of Birth</label>
                                            <input
                                                type="date"
                                                value={editData.date_of_birth}
                                                onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                            {editData.date_of_birth && (
                                                <p className={`mt-1 text-sm ${isDarkMode ? 'text-blue-400' : 'text-primary-600'}`}>
                                                    You are {calculateAge(editData.date_of_birth)} years old
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                                            <textarea
                                                value={editData.bio}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                placeholder="Tell us a little about yourself..."
                                                rows={4}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" isLoading={saving}>
                                            Save Changes
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Failed to load profile data.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profile;
