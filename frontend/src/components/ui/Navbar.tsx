import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
    const { logout } = useAuth();

    return (
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">EduZo</h2>
            <Button variant="secondary" onClick={logout} className="text-sm">Logout</Button>
        </header>
    );
};

export default Navbar;
