import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
    const { theme } = useTheme();

    // Memoizar componentes para evitar re-renders innecesarios
    const markdownComponents = React.useMemo(() => ({
        h2: ({ children }: any) => (
            <h2 className={`text-xl font-semibold mt-6 mb-3 ${theme === 'light' ? 'text-gray-900' : '!text-gray-300'
                }`}>
                {children}
            </h2>
        ),
        p: ({ children }: any) => (
            <p className={`mb-4 leading-relaxed ${theme === 'light' ? 'text-gray-700' : '!text-gray-300'
                }`}>
                {children}
            </p>
        ),
        ul: ({ children }: any) => (
            <ul className={`list-disc list-inside mb-4 space-y-2 ${theme === 'light' ? 'text-gray-700' : '!text-gray-300'
                }`}>
                {children}
            </ul>
        ),
        strong: ({ children }: any) => (
            <strong className={`font-semibold ${theme === 'light' ? 'text-gray-900' : '!text-gray-300'
                }`}>
                {children}
            </strong>
        )
    }), [theme]);

    if (!isOpen) return null;

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-slate-800'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center justify-between p-6 border-b ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                    }`}>
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : '!text-gray-300'
                        }`}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${theme === 'light'
                            ? 'text-gray-500 hover:text-gray-700'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                        aria-label="Cerrar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-none">
                        <ReactMarkdown components={markdownComponents}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className={`p-6 border-t ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'
                    }`}>
                    <button
                        onClick={onClose}
                        className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${theme === 'light'
                            ? 'bg-[var(--color-primary)] hover:opacity-90'
                            : 'bg-[var(--color-primary)] hover:opacity-90'
                            }`}
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-primary-text)'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
