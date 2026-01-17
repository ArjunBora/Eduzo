import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        enrollmentNo: '',
        department: '',
        program: '',
        enrollmentYear: new Date().getFullYear(),
        role: 'student',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload: any = {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                full_name: formData.fullName,
            };

            if (formData.role === 'student') {
                payload.enrollment_no = formData.enrollmentNo;
                payload.department = formData.department;
                payload.program = formData.program;
                payload.enrollment_year = formData.enrollmentYear;
            } else if (formData.role === 'faculty') {
                payload.faculty_department = formData.department;
            }

            await register(payload);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the educational platform today"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="student"
                            checked={formData.role === 'student'}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-700">Student</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="faculty"
                            checked={formData.role === 'faculty'}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-700">Faculty</span>
                    </label>
                </div>

                <Input
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                />

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                />

                {formData.role === 'student' ? (
                    <>
                        <Input
                            label="Enrollment No"
                            name="enrollmentNo"
                            value={formData.enrollmentNo}
                            onChange={handleChange}
                            required
                            placeholder="E123456"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Computer Science"
                            />
                            <Input
                                label="Program"
                                name="program"
                                value={formData.program}
                                onChange={handleChange}
                                placeholder="B.Tech"
                            />
                        </div>
                        <Input
                            label="Enrollment Year"
                            type="number"
                            name="enrollmentYear"
                            value={formData.enrollmentYear}
                            onChange={handleChange}
                            placeholder="2024"
                        />
                    </>
                ) : (
                    <Input
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        placeholder="Computer Science"
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full mt-4" isLoading={loading}>
                    Create Account
                </Button>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;
