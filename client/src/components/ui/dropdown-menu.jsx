import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// 1. Create a Context to share the open/close state
const DropdownContext = createContext();

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" ref={menuRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild }) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);

  // If asChild is true, we clone the child (like the User Button) and add the click handler
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        setIsOpen(!isOpen);
      }
    });
  }

  return (
    <button onClick={() => setIsOpen(!isOpen)} className="outline-none">
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, align = "center" }) => {
  const { isOpen } = useContext(DropdownContext);

  if (!isOpen) return null;

  // Simple alignment logic
  const alignmentClass = align === "end" ? "right-0" : "left-0";

  return (
    <div className={`absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-slate-950 shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-200 ${alignmentClass}`}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick }) => {
  const { setIsOpen } = useContext(DropdownContext);

  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
        setIsOpen(false); // Close menu on click
      }}
      className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-50 hover:text-green-700 font-medium"
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ children }) => (
  <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
    {children}
  </div>
);

export const DropdownMenuSeparator = () => (
  <div className="-mx-1 my-1 h-px bg-slate-100" />
);