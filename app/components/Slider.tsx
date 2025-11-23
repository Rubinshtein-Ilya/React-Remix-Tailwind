import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { UserIcon } from '@heroicons/react/24/outline';

interface SliderProps {
  expanded: boolean;
  disabled?: boolean;
}

const Slider = ({ expanded, disabled }: SliderProps) => {
  return (
    <nav
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-16 transition-all duration-300",
        expanded && "w-64",
        disabled ? "bg-gray-100" : "bg-white border-r border-gray-200"
      )}
    >
      <div className="flex h-full flex-col justify-between py-5">
        <div>
          {/* Logo section */}
          <div className="mb-6 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className={cn("h-8 w-8", expanded && "mr-3")}
            />
            {expanded && <span className="text-xl font-bold">Dashboard</span>}
          </div>

          {/* Navigation links */}
          <ul className="space-y-2 px-3">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg p-2 text-gray-900",
                    "hover:bg-gray-100",
                    disabled && "pointer-events-none opacity-50",
                    !expanded && "justify-center"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  {expanded && (
                    <span className="ml-3 flex-1 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer section */}
        <div className="px-3">
          <button
            className={cn(
              "flex w-full items-center rounded-lg p-2",
              "hover:bg-gray-100",
              disabled && "pointer-events-none opacity-50",
              !expanded && "justify-center"
            )}
          >
            <UserIcon className="h-6 w-6" />
            {expanded && (
              <span className="ml-3 flex-1 whitespace-nowrap">Profile</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Slider; 