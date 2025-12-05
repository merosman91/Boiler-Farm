// utils/helpers.js

// دالة مساعدة لإضافة أيام على تاريخ معين
export const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

// دالة formatDate إن لم تكن في UI.jsx
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
};

// دالة generateDefaultSchedule
export const generateDefaultSchedule = (batchId, startDate, addDaysFunc) => {
    const templates = [
        { day: 7, name: 'هتشنر + نيوكاسل', type: 'تقطير' }, 
        { day: 10, name: 'أنفلونزا', type: 'حقن' }, 
        { day: 12, name: 'جامبورو', type: 'شرب' }, 
        { day: 18, name: 'لاسوتا', type: 'شرب' }
    ];
    return templates.map((t, i) => ({ 
        id: Date.now() + i, 
        batchId, 
        name: t.name, 
        type: t.type, 
        date: addDaysFunc(startDate, t.day), 
        dayAge: t.day, 
        status: 'pending' 
    }));
};

// قوائم الاختيار
export const FEED_TYPES = ['بادي 23%', 'نامي 21%', 'ناهي 19%'];
export const DEATH_CAUSES = ['طبيعي', 'سموم فطرية', 'إجهاد حراري', 'أمراض تنفسية', 'كوكسيديا', 'سردة/فرزة', 'أخرى'];
