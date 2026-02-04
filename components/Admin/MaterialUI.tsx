import React, { ReactNode } from 'react';

// --- BUTTONS ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    startIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', size = 'md', fullWidth = false, startIcon, className = '', ...props
}) => {
    const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    const rounded = "rounded-lg";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg shadow-blue-500/30",
        secondary: "bg-slate-600 hover:bg-slate-700 text-white shadow-md hover:shadow-lg shadow-slate-500/30",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg shadow-red-500/30",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs uppercase tracking-wide",
        md: "px-5 py-2.5 text-sm uppercase tracking-wide",
        lg: "px-6 py-3.5 text-base uppercase tracking-wide"
    };

    return (
        <button
            className={`${baseStyle} ${rounded} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {startIcon && <span className="mr-2">{startIcon}</span>}
            {children}
        </button>
    );
};

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost' | 'primary' | 'danger', size?: 'sm' | 'md' }> = ({
    children, variant = 'ghost', size = 'md', className = '', ...props
}) => {
    const baseStyle = "inline-flex items-center justify-center rounded-full transition-colors focus:outline-none";
    const variants = {
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
        primary: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100"
    };
    const sizes = { sm: "w-8 h-8", md: "w-10 h-10" };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// --- INPUTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
            <input
                className={`w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-4 py-3 text-slate-700 outline-none transition-all placeholder:text-slate-400 text-sm ${className}`}
                {...props}
            />
        </div>
    );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
            <textarea
                className={`w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-4 py-3 text-slate-700 outline-none transition-all placeholder:text-slate-400 text-sm min-h-[100px] resize-y ${className}`}
                {...props}
            />
        </div>
    );
};

// --- CARDS ---
export const Card: React.FC<{ children: ReactNode; className?: string; title?: string; subtitle?: string; actions?: ReactNode }> = ({
    children, className = '', title, subtitle, actions
}) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
            {(title || actions) && (
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white">
                    <div>
                        {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

// --- MODAL ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions, maxWidth = 'md' }) => {
    if (!isOpen) return null;

    const maxWidths = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl"
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidths[maxWidth]} transform transition-all flex flex-col max-h-[90vh]`}>
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        ✕
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                {actions && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- BADGE ---
export const Badge: React.FC<{ children: ReactNode; variant?: 'success' | 'warning' | 'info' | 'default' }> = ({ children, variant = 'default' }) => {
    const variants = {
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-700",
        info: "bg-blue-100 text-blue-700",
        default: "bg-slate-100 text-slate-600"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
            {children}
        </span>
    );
};

// --- SWITCH ---
interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
    return (
        <div
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${checked ? 'bg-green-500' : 'bg-slate-200'}`}
            onClick={() => !disabled && onChange(!checked)}
        >
            <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${checked ? 'left-7' : 'left-1'
                    }`}
            />
        </div>
    );
};
