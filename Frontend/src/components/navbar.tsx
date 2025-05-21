import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import {
  FileText,
  Home,
  ImageIcon,
  Menu,
  Moon,
  Sun,
  Video,
  LogOut,
  User,
  Settings,
  ChevronDown,
  CreditCard,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/Sheet";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, signOut, loading } = useAuth();

  const routes = [
    { href: "/", label: "Home", icon: Home },
    { href: "/image-chat", label: "Image Analysis", icon: ImageIcon },
    { href: "/document-chat", label: "Document QA", icon: FileText },
    { href: "/video-chat", label: "Video Analysis", icon: Video },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isRouteActive = (href: string) => location.pathname === href;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    navigate('/login'); // Navigate to login page after sign out
  };

  const renderNavLinks = (isMobile = false) => (
    routes.map((route) => (
      <Link
        key={route.href}
        to={route.href}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
          ${isRouteActive(route.href) ? 'bg-gray-200 dark:bg-gray-700 text-foreground' : 'text-gray-600 dark:text-gray-400'}
        `}
        onClick={() => isMobile && setOpen(false)}
      >
        <route.icon className="h-4 w-4" />
        <span>{route.label}</span>
      </Link>
    ))
  );

  // User profile menu items
  const profileMenuItems = [
    {
      label: "Your Profile",
      icon: User,
      href: "/profile",
      onClick: () => setProfileDropdownOpen(false),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      onClick: () => setProfileDropdownOpen(false),
    },
    {
      label: "Credits",
      icon: CreditCard,
      href: "/credits",
      onClick: () => setProfileDropdownOpen(false),
    },
    {
      label: "Sign out",
      icon: LogOut,
      href: null,
      onClick: handleSignOut,
      className: "text-red-600 dark:text-red-400",
    },
  ];

  // Render profile dropdown content
  const renderProfileDropdown = () => {
    if (!user) return null;
    
    return (
      <div className="absolute right-0 mt-2 top-full w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.user_metadata?.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
        <div className="py-1" role="menu" aria-orientation="vertical">
          {profileMenuItems.map((item, index) => (
            item.href ? (
              <Link
                key={index}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${item.className || ''}`}
                role="menuitem"
                onClick={item.onClick}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ) : (
              <button
                key={index}
                className={`w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${item.className || ''}`}
                onClick={item.onClick}
                role="menuitem"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </button>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">
              MultiModal<span className="text-purple-600">RAG</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link to="/" className="flex items-center gap-2 mb-8" onClick={() => setOpen(false)}>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                MultiModal RAG
              </span>
            </Link>
            <nav className="grid gap-4 text-lg font-medium">
              {renderNavLinks(true)}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Theme Toggle & Auth UI on Larger Screens */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link to="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                MultiModal RAG
              </span>
            </Link>
          </div>

          {/* Auth Section */}
          {!loading && user ? (
            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
              {/* Profile Dropdown Trigger */}
              <button 
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.user_metadata?.avatar_url || ''}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && renderProfileDropdown()}
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          ) : null}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}