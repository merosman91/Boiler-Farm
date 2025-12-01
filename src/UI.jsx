import React from 'react';
import { X } from 'lucide-react';

// --- 1. دوال مساعدة ---
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('ar-EG');
};

export const getDaysDifference = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const diff = today - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // +1 ليكون اليوم الأول هو يوم 1
};

// --- 2. مكونات الواجهة ---
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden my-auto relative animate-scale-up">
        <button onClick={onClose} className="absolute top-3 left-3 p-1 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
        <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-800 text-center">{title}</h3></div>
        <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

export const Button = ({ children, onClick, variant = 'primary', className = "" }) => {
  const variants = {
    primary: "bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700", // لون الدواجن الأساسي
    success: "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
    ghost: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    dark: "bg-gray-800 text-white hover:bg-gray-900"
  };
  return (
    <button onClick={onClick} className={`px-4 py-3 rounded-xl font-bold active:scale-95 flex items-center justify-center gap-2 transition-all ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = ({ label, ...props }) => (
  <div className="mb-3">
    {label && <label className="block text-xs font-bold text-gray-400 mb-1 mr-1">{label}</label>}
    <input {...props} className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-colors" />
  </div>
);

// رسم بياني للأوزان
export const WeightChart = ({ data }) => {
    if(!data || data.length === 0) return <div className="text-center py-4 text-gray-400 text-xs">لا توجد بيانات وزن</div>;
    const maxVal = Math.max(...data.map(d => d.val)) || 1;
    return (
        <div className="flex items-end gap-2 h-40 mt-4 pb-2 border-b border-gray-200 px-2 overflow-x-auto">
            {data.slice(-10).map((item, idx) => (
                <div key={idx} className="flex-1 min-w-[30px] flex flex-col justify-end items-center gap-1 group h-full">
                    <span className="text-[9px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.val}g</span>
                    <div style={{height: `${(item.val/maxVal)*100}%`}} className="w-full bg-orange-400 rounded-t-md opacity-80 group-hover:opacity-100 transition-all"></div>
                    <span className="text-[9px] text-gray-400 font-bold">يوم {item.day}</span>
                </div>
            ))}
        </div>
    );
};
