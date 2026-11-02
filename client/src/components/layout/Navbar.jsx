import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, PenTool, LayoutDashboard, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary-600 rounded-lg group-hover:bg-primary-500 transition-colors">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">MegaBlog</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Explorer</Link>
            <div className="relative group">
               <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-800 text-slate-200 pl-10 pr-4 py-1.5 rounded-full border border-transparent focus:border-primary-500 focus:outline-none transition-all w-64"
               />
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-all">Log in</Link>
                <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg shadow-lg shadow-primary-900/20 transition-all transform active:scale-95">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
