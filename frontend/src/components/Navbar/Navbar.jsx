import React, { useState, useRef, useEffect } from 'react';
import { 
  DatabaseSearch, 
  ChevronDown, 
  FileText, 
  Ticket, 
  LogOut
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, onLogout, onOpenDocuments, onOpenTickets }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const displayName = user?.name || user?.full_name || 'SME Employee';
  const displayEmail = user?.email || 'employee@company.com';

  return (
    <header className="navbar-container">
      {/* Left Brand Title */}
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <DatabaseSearch size={24} />
        </div>
        <div className="brand-text-container">
          <span className="brand-title">DocuQuery</span>
          <span className="brand-subtitle">Ask. Find. Resolve.</span>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="navbar-right" ref={dropdownRef}>
        <div className="status-pill">
          <span className="status-dot"></span>
          RAG Pipeline Ready
        </div>

        {user ? (
          <>
            {/* Top Right Profile Icon Trigger */}
            <div 
              className="profile-pill-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Click to view Profile & Menu"
            >
              <div className="profile-avatar-circle">
                {getInitial()}
              </div>
              <span className="profile-pill-name">{displayName.split(' ')[0]}</span>
              <ChevronDown size={16} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
            </div>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-large">
                    {getInitial()}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{displayName}</span>
                    <span className="dropdown-user-email">{displayEmail}</span>
                  </div>
                </div>

                <div className="dropdown-menu-list">
                  <button 
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onOpenDocuments) onOpenDocuments();
                    }}
                  >
                    <FileText size={16} color="#6366f1" />
                    All Uploaded Documents
                  </button>

                  <button 
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onOpenTickets) onOpenTickets();
                    }}
                  >
                    <Ticket size={16} color="#8b5cf6" />
                    Support Tickets
                  </button>

                  <div className="dropdown-divider"></div>

                  <button 
                    type="button"
                    className="dropdown-item logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
