import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { CurrencySwitcher } from './CurrencySwitcher';
import { ROUTES } from '../constants';
import { RoleEnum } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isOwner = user?.role === RoleEnum.OWNER;
  const isRider = user?.role === RoleEnum.RIDER;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
           <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              O
            </div>
            <span className="text-lg font-bold text-slate-900">Ownima</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {isAuthenticated ? (
            <>
               {isOwner && (
                 <Link 
                   to={ROUTES.DASHBOARD}
                   className={`text-sm font-medium ${location.pathname === ROUTES.DASHBOARD ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                 >
                   Dashboard
                 </Link>
               )}
               {isRider && (
                  <Link 
                    to={ROUTES.SEARCH}
                    className={`text-sm font-medium ${location.pathname === ROUTES.SEARCH ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Find a Car
                  </Link>
               )}
              <div className="h-4 w-px bg-slate-300"></div>
              
              <CurrencySwitcher />
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  {user?.full_name || user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <CurrencySwitcher />
              <div className="h-4 w-px bg-slate-300"></div>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4">
             <div className="flex justify-between items-center">
               <span className="text-sm font-medium text-slate-600">Currency</span>
               <CurrencySwitcher />
             </div>
             {isAuthenticated ? (
               <>
                 <div className="flex flex-col gap-2">
                   <div className="text-sm font-medium text-slate-900">{user?.full_name}</div>
                   <div className="text-xs text-slate-500">{user?.email}</div>
                 </div>
                 {isOwner && <Link to={ROUTES.DASHBOARD} className="text-slate-600">Dashboard</Link>}
                 {isRider && <Link to={ROUTES.SEARCH} className="text-slate-600">Search</Link>}
                 <Button variant="outline" size="sm" onClick={logout} className="w-full">Sign Out</Button>
               </>
             ) : (
               <>
                 <Link to={ROUTES.LOGIN}><Button variant="ghost" className="w-full">Sign In</Button></Link>
                 <Link to={ROUTES.REGISTER}><Button variant="primary" className="w-full">Get Started</Button></Link>
               </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};