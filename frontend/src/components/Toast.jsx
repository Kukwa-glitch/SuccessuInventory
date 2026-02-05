import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-500',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-500',
    },
    info: {
      icon: Info,
      className: 'bg-primary-600',
    },
  };

  const { icon: Icon, className } = config[type] || config.info;

  return (
    <div
      className={`${className} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in pointer-events-auto min-w-[300px]`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium flex-1">{message}</span>
      <button
        onClick={onClose}
        className="hover:bg-white/20 rounded p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;