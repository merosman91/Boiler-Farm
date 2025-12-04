import React, { useState, useEffect } from 'react';
import { 
  Bird, DollarSign, Activity, Trash2, Plus, Edit2, Share2, Wheat, 
  Scale, Info, Code, Mail, Phone, Syringe, CheckCircle, Clock, 
  FileText, Download, Calendar, Skull, PackageOpen, TrendingUp, 
  TrendingDown, Thermometer, AlertTriangle 
} from 'lucide-react';
import { Button, Card, Input, Modal, WeightChart, formatDate, getDaysDifference } from './UI';

// 🔥 SplashScreen Component
const SplashScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 20;
            });
        }, 300);

        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(() => onFinish(), 500);
        }, 6000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 z-50 flex flex-col items-center justify-center">
            {/* شعار مع أنيميشن */}
            <div className="animate-bounce mb-6">
                <Bird size={80} className="text-white drop-shadow-lg" />
            </div>
            
            {/* اسم التطبيق */}
            <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-lg">
                دواجني
            </h1>
            <p className="text-white/80 mb-8 text-center">
                نظام إدارة مزارع الدواجن الذكي
            </p>
            
            {/* شريط التحميل */}
            <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden mb-12">
                <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            {/* توقيع المطور */}
            <div className="text-center">
                <div className="text-white/70 text-sm mb-3">التطوير بواسطة</div>
                <div className="flex items-center justify-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-lg">م</span>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-bold">ميرغني أبوالقاسم</div>
                        <div className="text-white/80 text-xs"> مطور نظم معلومات</div>
                    </div>
                </div>
                
                {/* معلومات الإصدار */}
                <div className="mt-6 text-white/60 text-xs">
                    <p>الإصدار 1.0.0 • © {new Date().getFullYear()}</p>
                    <p className="mt-1">جميع الحقوق محفوظة</p>
                </div>
                
                {/* رسالة ترحيبية */}
                <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
                    <p className="text-white text-xs">🚀 جاهز لإدارة حظيرتك بكل كفاءة!</p>
                </div>
            </div>
            
            {/* إضافة أنيميشن CSS */}
            <style>{`
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; transform: scale(0.95); }
                }
                .splash-out {
                    animation: fadeOut 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// دالة مساعدة لإضافة أيام على تاريخ معين
const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: () => {} });

  // --- البيانات ---
  const [batches, setBatches] = useState(() => JSON.parse(localStorage.getItem('batches')) || []);
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem('dailyLogs')) || []);
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('sales')) || []);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
  const [vaccinations, setVaccinations] = useState(() => JSON.parse(localStorage.getItem('vaccinations')) || []);

  const activeBatch = batches.find(b => b.status === 'active');

  useEffect(() => {
    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('vaccinations', JSON.stringify(vaccinations));
  }, [batches, dailyLogs, sales, expenses, vaccinations]);

  const showNotify = (msg) => { 
    setNotification(msg); 
    setTimeout(() => setNotification(null), 3000); 
  };
  
  const handleDelete = (title, action) => { 
    setConfirmDialog({ 
      isOpen: true, 
      title: `حذف ${title}؟`, 
      onConfirm: () => { 
        action(); 
        setConfirmDialog({ ...confirmDialog, isOpen: false }); 
        showNotify("تم الحذف"); 
      } 
    }); 
  };
  
  const shareViaWhatsapp = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

  const downloadBackup = () => {
    const data = { batches, dailyLogs, sales, expenses, vaccinations };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const a = document.createElement('a'); 
    a.href = dataStr; 
    a.download = `poultry_smart_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    showNotify("تم حفظ النسخة الاحتياطية");
  };

  // --- Developer Signature Component ---
  const DeveloperInfo = () => {
    const [showDev, setShowDev] = useState(false);
    return (
        <>
            <div className="py-6 text-center">
                <button onClick={() => setShowDev(true)} className="text-[10px] text-gray-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                    <Code size={12}/> تم التطوير بواسطة <span className="font-bold border-b border-gray-300 pb-[1px]">ميرغني أبوالقاسم</span> v1.0
                </button>
            </div>

            <Modal isOpen={showDev} onClose={() => setShowDev(false)} title="عن المطور">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
                        <Code size={32}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">ميرغني أبوالقاسم</h3>
                        <p className="text-xs text-gray-500">مطور نظم معلومات وتطبيقات ويب</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-sm space-y-2 text-right">
                        <p className="text-xs text-gray-400 text-center mb-2">لطلب نسخ خاصة أو دعم فني:</p>
                        <a href="tel:+249921027104" className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors">
                            <div className="bg-green-100 p-1.5 rounded text-green-600"><Phone size={16}/></div>
                            <span className="font-bold text-gray-700">اتصال هاتفي</span>
                        </a>
                        <a href="https://wa.me/249921027104" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors">
                            <div className="bg-emerald-100 p-1.5 rounded text-emerald-600"><Share2 size={16}/></div>
                            <span className="font-bold text-gray-700">واتساب</span>
                        </a>
                        <a href="mailto:merghanigasimosman@gmail.com" className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors">
                            <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Mail size={16}/></div>
                            <span className="font-bold text-gray-700">بريد إلكتروني</span>
                        </a>
                    </div>
                    <p className="text-[10px] text-gray-300 pt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
                </div>
            </Modal>
        </>
    );
  };

  // --- 1. Dashboard (محدثة: مع أيقونة المعلومات) ---
  const Dashboard = () => {
    const [showInfo, setShowInfo] = useState(false);

    if (!activeBatch) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
            <Bird size={64} className="text-gray-300 mb-4"/>
            <h2 className="text-xl font-bold text-gray-700">لا توجد دورة نشطة</h2>
            <Button onClick={() => setActiveTab('batches')} className="mt-4">بدء دورة جديدة</Button>
        </div>
    );

    const batchLogs = dailyLogs.filter(l => l.batchId === activeBatch.id);
    const totalDead = batchLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
    const currentCount = activeBatch.initialCount - totalDead;
    const mortalityRate = ((totalDead / activeBatch.initialCount) * 100);
    const livability = 100 - mortalityRate;
    const totalFeed = batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
    const age = getDaysDifference(activeBatch.startDate);
    
    const lastWeightLog = [...batchLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).find(l => l.avgWeight);
    const currentWeightGM = lastWeightLog ? Number(lastWeightLog.avgWeight) : 0;
    const currentWeightKG = currentWeightGM / 1000;

    const totalBiomass = currentCount * currentWeightKG;
    const fcr = totalBiomass > 0 ? (totalFeed / totalBiomass).toFixed(2) : "0.00";

    let epef = 0;
    if (age > 0 && Number(fcr) > 0) {
        epef = ((currentWeightGM * livability) / (Number(fcr) * age * 10)).toFixed(0);
    }

    const batchSales = sales.filter(s => s.batchId === activeBatch.id).reduce((sum, s) => sum + Number(s.total), 0);
    const batchExpenses = expenses.filter(e => e.batchId === activeBatch.id).reduce((sum, e) => sum + Number(e.cost), 0);
    const dueVaccines = vaccinations.filter(v => v.batchId === activeBatch.id && v.status === 'pending' && v.date <= new Date().toISOString().split('T')[0]);

    const chartData = batchLogs.filter(l => l.avgWeight).map(l => ({ 
        day: getDaysDifference(activeBatch.startDate) - (getDaysDifference(activeBatch.startDate) - getDaysDifference(l.date)), 
        val: l.avgWeight 
    })).sort((a,b)=>a.day-b.day);

    return (
      <div className="space-y-4 pb-20 animate-fade-in">
        {dueVaccines.length > 0 && (
            <div className="bg-purple-100 border-l-4 border-purple-600 p-3 rounded-r-xl shadow-sm flex items-center justify-between">
                <div><h3 className="font-bold text-purple-800 text-sm">💉 تحصينة مستحقة اليوم</h3><p className="text-xs text-purple-700">{dueVaccines[0].name}</p></div>
                <Button onClick={() => setActiveTab('health')} variant="ghost" className="text-xs bg-white h-8">عرض</Button>
            </div>
        )}

        {/* الكارت الرئيسي مع أيقونة المعلومات */}
        <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-5 text-white shadow-xl relative">
           <button onClick={() => setShowInfo(true)} className="absolute top-2 left-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors">
               <Info size={16} className="text-white" />
           </button>

           <div className="flex justify-between items-start mb-4 mt-2">
              <div><h2 className="text-lg font-bold">{activeBatch.name}</h2><p className="text-xs opacity-80">عمر {age} يوم</p></div>
              <div className="text-center">
                  <p className="text-[10px] opacity-80">مؤشر الكفاءة (EPEF)</p>
                  <p className={`font-bold text-2xl ${epef > 300 ? 'text-green-300' : 'text-white'}`}>{epef}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-4 gap-2 text-center border-t border-white/20 pt-3">
               <div><p className="text-[10px] opacity-70">التحويل FCR</p><p className="font-bold">{fcr}</p></div>
               <div><p className="text-[10px] opacity-70">الوزن (جم)</p><p className="font-bold">{currentWeightGM}</p></div>
               <div><p className="text-[10px] opacity-70">النافق %</p><p className="font-bold">{mortalityRate.toFixed(1)}%</p></div>
               <div><p className="text-[10px] opacity-70">العلف</p><p className="font-bold">{totalFeed}</p></div>
           </div>
        </div>

        <Card>
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-gray-700 text-sm flex items-center gap-2"><Scale size={18} className="text-blue-500"/> منحنى الوزن</h3></div>
            <WeightChart data={chartData} />
        </Card>

        <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 border-emerald-100 p-3"><p className="text-xs text-emerald-800 font-bold mb-1">المبيعات</p><p className="text-lg font-bold text-emerald-700">{batchSales.toLocaleString()}</p></Card>
            <Card className="bg-rose-50 border-rose-100 p-3"><p className="text-xs text-rose-800 font-bold mb-1">المصروفات</p><p className="text-lg font-bold text-rose-700">{batchExpenses.toLocaleString()}</p></Card>
        </div>

        {/* نافذة المعلومات */}
        <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="دليل المؤشرات الفنية">
            <div className="space-y-4 text-sm text-gray-700">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-1">1. معامل التحويل (FCR)</h4>
                    <p className="text-xs mb-2">كمية العلف لإنتاج 1 كجم لحم.</p>
                    <ul className="list-disc mr-4 text-[13px] text-gray-600"><li>المعادلة: إجمالي العلف / الوزن القائم.</li><li>⭐ 1.5 (ممتاز) | ⚠️ 1.8+ (سيء).</li></ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-1">2. مؤشر الكفاءة (EPEF)</h4>
                    <p className="text-xs mb-2">مقياس نجاح الدورة العالمي.</p>
                    <ul className="list-disc mr-4 text-[13px] text-gray-600"><li>⭐ 300+ (ناجح) | ⚠️ أقل من 250 (ضعيف).</li></ul>
                </div>
            </div>
        </Modal>

        {/* توقيع المطور في Dashboard */}
        <DeveloperInfo />
      </div>
    );
  };

  // --- 2. Health Manager (جدول التحصينات) ---
  const HealthManager = () => {
      if (!activeBatch) return <p className="text-center text-gray-500 py-10">ابدأ دورة لعرض الجدول</p>;
      
      const batchVaccines = vaccinations.filter(v => v.batchId === activeBatch.id).sort((a,b) => new Date(a.date) - new Date(b.date));
      const [showModal, setShowModal] = useState(false);
      const [newVac, setNewVac] = useState({ name: '', type: 'مياه شرب', date: new Date().toISOString().split('T')[0], notes: '' });

      const toggleStatus = (id) => {
          const updated = vaccinations.map(v => v.id === id ? { ...v, status: v.status === 'done' ? 'pending' : 'done' } : v);
          setVaccinations(updated);
      };

      const addCustomVaccine = () => {
          if(!newVac.name) return;
          setVaccinations([...vaccinations, { ...newVac, id: Date.now(), batchId: activeBatch.id, status: 'pending' }]);
          setNewVac({ name: '', type: 'مياه شرب', date: new Date().toISOString().split('T')[0], notes: '' });
          setShowModal(false); showNotify("تمت الإضافة");
      };

      return (
          <div className="space-y-4 pb-20 animate-slide-up">
              <div className="flex justify-between items-center">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2"><Syringe className="text-purple-600"/> جدول التحصينات</h2>
                  <button onClick={() => setShowModal(true)} className="bg-purple-100 text-purple-600 p-2 rounded-lg text-xs font-bold flex items-center gap-1"><Plus size={14}/> إضافة</button>
              </div>

              <div className="space-y-3">
                  {batchVaccines.map(v => {
                      const isDone = v.status === 'done';
                      const isDue = !isDone && v.date <= new Date().toISOString().split('T')[0];
                      const ageAtVaccine = getDaysDifference(activeBatch.startDate) - (getDaysDifference(activeBatch.startDate) - getDaysDifference(v.date));

                      return (
                          <div key={v.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isDone ? 'bg-gray-50 border-gray-200 opacity-60' : isDue ? 'bg-purple-50 border-purple-300 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100'}`}>
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${isDone ? 'bg-gray-200' : isDue ? 'bg-purple-500 text-white' : 'bg-blue-50 text-blue-500'}`}>
                                      {isDone ? <CheckCircle size={20}/> : <Clock size={20}/>}
                                  </div>
                                  <div>
                                      <p className={`font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{v.name}</p>
                                      <p className="text-xs text-gray-500">{formatDate(v.date)} • عمر {v.dayAge || ageAtVaccine} يوم • {v.type}</p>
                                  </div>
                              </div>
                              <button onClick={() => toggleStatus(v.id)} className={`px-3 py-1 rounded text-xs font-bold border ${isDone ? 'border-gray-300 text-gray-500' : 'bg-white border-purple-200 text-purple-600'}`}>
                                  {isDone ? 'تراجع' : 'تم'}
                              </button>
                          </div>
                      );
                  })}
              </div>

              <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة تحصينة/علاج">
                  <div className="space-y-3">
                      <Input label="اسم التحصينة/الدواء" value={newVac.name} onChange={e => setNewVac({...newVac, name: e.target.value})} />
                      <div className="flex gap-2">
                          <Input label="التاريخ" type="date" value={newVac.date} onChange={e => setNewVac({...newVac, date: e.target.value})} />
                          <div className="flex-1">
                              <label className="text-xs font-bold text-gray-400 mb-1 block">الطريقة</label>
                              <select className="w-full p-3 bg-gray-50 border rounded-xl" value={newVac.type} onChange={e => setNewVac({...newVac, type: e.target.value})}>
                                  <option>مياه شرب</option><option>تقطير</option><option>رش</option><option>حقن</option>
                              </select>
                          </div>
                      </div>
                      <Input label="ملاحظات" value={newVac.notes} onChange={e => setNewVac({...newVac, notes: e.target.value})} />
                      <Button onClick={addCustomVaccine} className="w-full">حفظ</Button>
                  </div>
              </Modal>
          </div>
      );
  };

  // --- 3. Batch Manager (إدارة الدورات) ---
  const BatchManager = () => {
      const [view, setView] = useState('list');
      const [newBatch, setNewBatch] = useState({ name: '', startDate: new Date().toISOString().split('T')[0], initialCount: '', breed: '' });
      const [selectedBatchReport, setSelectedBatchReport] = useState(null);

      const generateDefaultSchedule = (batchId, startDate) => {
          const templates = [{ day: 7, name: 'هتشنر + نيوكاسل', type: 'تقطير' }, { day: 10, name: 'أنفلونزا', type: 'حقن' }, { day: 12, name: 'جامبورو', type: 'شرب' }, { day: 18, name: 'لاسوتا', type: 'شرب' }];
          return templates.map((t, i) => ({ id: Date.now() + i, batchId, name: t.name, type: t.type, date: addDays(startDate, t.day), dayAge: t.day, status: 'pending' }));
      };

      const startBatch = () => {
          if (!newBatch.name || !newBatch.initialCount) return showNotify("البيانات ناقصة");
          const batchId = Date.now();
          const updatedBatches = batches.map(b => b.status === 'active' ? {...b, status: 'closed', endDate: new Date().toISOString()} : b);
          setBatches([...updatedBatches, { ...newBatch, id: batchId, status: 'active' }]);
          setVaccinations([...vaccinations, ...generateDefaultSchedule(batchId, newBatch.startDate)]);
          setNewBatch({ name: '', startDate: '', initialCount: '', breed: '' }); 
          setView('list'); 
          showNotify("تم بدء الدورة");
      };

      const activateBatch = (id) => {
          const updated = batches.map(b => ({ ...b, status: b.id === id ? 'active' : 'closed', endDate: b.id === id ? null : (b.status === 'active' ? new Date().toISOString() : b.endDate) }));
          setBatches(updated);
          showNotify("تم تفعيل الدورة ✅");
      };

      const getReportStats = (batch) => {
          const bLogs = dailyLogs.filter(l => l.batchId === batch.id);
          const bSales = sales.filter(s => s.batchId === batch.id).reduce((sum, s) => sum + Number(s.total), 0);
          const bExp = expenses.filter(e => e.batchId === batch.id).reduce((sum, e) => sum + Number(e.cost), 0);
          const dead = bLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
          const feed = bLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
          const lastWt = [...bLogs].sort((a,b)=>new Date(b.date)-new Date(a.date)).find(l=>l.avgWeight)?.avgWeight || 0;
          return { bSales, bExp, profit: bSales - bExp, dead, feed, lastWt };
      };

      return (
          <div className="space-y-4 pb-20">
              {view === 'list' && (
                  <>
                    <Button onClick={() => setView('new')} className="w-full"><Plus size={18}/> بدء دورة جديدة</Button>
                    <div className="space-y-3 mt-4">
                        {batches.map(b => (
                            <div key={b.id} onClick={() => setSelectedBatchReport(b)} className={`p-4 rounded-xl border relative cursor-pointer active:scale-95 transition-all ${b.status === 'active' ? 'bg-orange-50 border-orange-200 shadow-md' : 'bg-white border-gray-100'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{b.name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(b.startDate)} • {b.initialCount} طائر</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{b.breed}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {b.status === 'active' ? 'نشطة' : 'مغلقة'}
                                        </span>
                                        {b.status !== 'active' && (
                                            <button onClick={(e) => { e.stopPropagation(); activateBatch(b.id); }} className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200">
                                                تفعيل
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                  </>
              )}

              {view === 'new' && (
                  <Card>
                      <h3 className="font-bold mb-4 text-center">دورة جديدة</h3>
                      <Input label="الاسم" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} />
                      <Input label="التاريخ" type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} />
                      <div className="flex gap-2">
                          <Input label="العدد" type="number" value={newBatch.initialCount} onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})} />
                          <Input label="السلالة" value={newBatch.breed} onChange={e => setNewBatch({...newBatch, breed: e.target.value})} />
                      </div>
                      <Button onClick={startBatch} className="w-full">حفظ وبدء</Button>
                  </Card>
              )}

              {selectedBatchReport && (
                  <Modal isOpen={!!selectedBatchReport} onClose={() => setSelectedBatchReport(null)} title={`تقرير: ${selectedBatchReport.name}`}>
                      {(() => {
                          const stats = getReportStats(selectedBatchReport);
                          return (
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3 text-center">
                                      <div className="bg-emerald-50 p-2 rounded-lg"><p className="text-xs text-gray-500">الربح</p><p className={`font-bold ${stats.profit>=0?'text-emerald-600':'text-red-600'}`}>{stats.profit.toLocaleString()}</p></div>
                                      <div className="bg-blue-50 p-2 rounded-lg"><p className="text-xs text-gray-500">الوزن النهائي</p><p className="font-bold text-blue-600">{stats.lastWt} جم</p></div>
                                      <div className="bg-red-50 p-2 rounded-lg"><p className="text-xs text-gray-500">النافق</p><p className="font-bold text-red-600">{stats.dead}</p></div>
                                      <div className="bg-amber-50 p-2 rounded-lg"><p className="text-xs text-gray-500">العلف</p><p className="font-bold text-amber-600">{stats.feed} كجم</p></div>
                                  </div>
                                  <div className="text-xs space-y-1 bg-gray-50 p-3 rounded text-gray-600">
                                      <p>• إجمالي المبيعات: {stats.bSales.toLocaleString()}</p>
                                      <p>• إجمالي المصاريف: {stats.bExp.toLocaleString()}</p>
                                      <p>• تاريخ البدء: {formatDate(selectedBatchReport.startDate)}</p>
                                  </div>
                                  <Button onClick={() => shareViaWhatsapp(`تقرير دورة ${selectedBatchReport.name}\nالربح: ${stats.profit}\nالنافق: ${stats.dead}\nالوزن: ${stats.lastWt}`)} variant="success" className="w-full">مشاركة واتساب</Button>
                              </div>
                          );
                      })()}
                  </Modal>
              )}
          </div>
      );
  };

  // --- 4. DailyOperations (اليوميات) ---
  const DailyOperations = () => {
      if (!activeBatch) return <p className="text-center text-gray-500 py-10">ابدأ دورة أولاً</p>;
      
      const [view, setView] = useState('list');
      const [log, setLog] = useState({ id: null, date: new Date().toISOString().split('T')[0], dead: '', deadCause: 'طبيعي', feed: '', feedType: 'بادي 23%', avgWeight: '', temp: '', notes: '' });

      const saveLog = () => {
          if (log.id) {
              setDailyLogs(dailyLogs.map(l => l.id === log.id ? { ...log, batchId: activeBatch.id } : l));
              showNotify("تم تعديل السجل ✏️");
          } else {
              setDailyLogs([...dailyLogs, { ...log, id: Date.now(), batchId: activeBatch.id }]);
              showNotify("تم الحفظ ✅");
          }
          setLog({ id: null, date: new Date().toISOString().split('T')[0], dead: '', deadCause: 'طبيعي', feed: '', feedType: 'بادي 23%', avgWeight: '', temp: '', notes: '' });
          setView('list'); 
      };

      const handleEditLog = (item) => {
          setLog(item);
          setView('new');
      };

      const FEED_TYPES = ['بادي 23%', 'نامي 21%', 'ناهي 19%'];
      const DEATH_CAUSES = ['طبيعي', 'سموم فطرية', 'إجهاد حراري', 'أمراض تنفسية', 'كوكسيديا', 'سردة/فرزة', 'أخرى'];

      return (
          <div className="space-y-4 pb-20">
              <div className="flex p-1 bg-gray-200 rounded-xl">
                  <button onClick={() => { setView('list'); setLog({ id: null, date: new Date().toISOString().split('T')[0], dead: '', deadCause: 'طبيعي', feed: '', feedType: 'بادي 23%', avgWeight: '', temp: '', notes: '' }); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>السجل</button>
                  <button onClick={() => setView('new')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'new' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
                      {log.id ? 'تعديل' : 'جديد'}
                  </button>
              </div>

              {view === 'new' && (
                  <Card className="animate-slide-up">
                      <Input label="التاريخ" type="date" value={log.date} onChange={e => setLog({...log, date: e.target.value})} />
                      <div className="bg-red-50 p-3 rounded-xl mb-3 border border-red-100">
                          <label className="text-xs font-bold text-red-800 block mb-2 flex items-center gap-1"><Skull size={14}/> النافق</label>
                          <div className="flex gap-2">
                              <input type="number" className="flex-1 p-2 rounded border border-red-200" value={log.dead} onChange={e => setLog({...log, dead: e.target.value})} placeholder="العدد" />
                              <select className="flex-1 p-2 rounded border border-red-200 text-xs bg-white" value={log.deadCause} onChange={e => setLog({...log, deadCause: e.target.value})}>{DEATH_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                          </div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                          <label className="text-xs font-bold text-amber-800 block mb-2 flex items-center gap-1"><Wheat size={14}/> العلف</label>
                          <div className="flex gap-2">
                              <input type="number" className="flex-1 p-2 rounded border border-amber-200" value={log.feed} onChange={e => setLog({...log, feed: e.target.value})} placeholder="كجم" />
                              <select className="flex-1 p-2 rounded border border-amber-200 text-xs bg-white" value={log.feedType} onChange={e => setLog({...log, feedType: e.target.value})}>{FEED_TYPES.map(f => <option key={f} value={f}>{f}</option>)}</select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <Input label="الوزن (جم)" type="number" value={log.avgWeight} onChange={e => setLog({...log, avgWeight: e.target.value})} />
                          <Input label="الحرارة" type="number" value={log.temp} onChange={e => setLog({...log, temp: e.target.value})} />
                      </div>
                      <Input label="ملاحظات" value={log.notes} onChange={e => setLog({...log, notes: e.target.value})} />
                      <Button onClick={saveLog} className="w-full mt-2">{log.id ? 'حفظ التعديلات' : 'حفظ البيانات'}</Button>
                  </Card>
              )}

              {view === 'list' && (
                  <div className="space-y-2">
                      {dailyLogs.filter(l => l.batchId === activeBatch.id).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(l => (
                          <div key={l.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs">
                              <div className="flex justify-between font-bold text-gray-800 mb-2 border-b pb-1">
                                  <span>{formatDate(l.date)}</span>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleEditLog(l)} className="text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded"><Edit2 size={12}/> تعديل</button>
                                      <button onClick={() => handleDelete('سجل', () => setDailyLogs(dailyLogs.filter(d => d.id !== l.id)))} className="text-red-500 bg-red-50 px-2 py-0.5 rounded"><Trash2 size={12}/></button>
                                  </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-gray-500">
                                  <div><p>علف</p><p className="font-bold text-amber-600">{l.feed} كجم</p></div>
                                  <div><p>وزن</p><p className="font-bold text-blue-600">{l.avgWeight || '-'} جم</p></div>
                                  <div><p>نافق</p><p className="font-bold text-red-600">{l.dead || '-'}</p></div>
                              </div>
                              {l.notes && <p className="mt-1 text-gray-400 italic">"{l.notes}"</p>}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  // --- 5. Financials (المالية) ---
  const Financials = () => {
    if (!activeBatch) return null;
    const [view, setView] = useState('sales');
    const [newSale, setNewSale] = useState({ buyer: '', count: '', weight: '', price: '', date: new Date().toISOString().split('T')[0] });
    const [newExpense, setNewExpense] = useState({ item: '', cost: '', date: new Date().toISOString().split('T')[0] });

    const saveSale = () => { 
        const total = Number(newSale.weight || newSale.count) * Number(newSale.price); 
        setSales([...sales, { ...newSale, total, id: Date.now(), batchId: activeBatch.id }]); 
        setNewSale({...newSale, buyer:'', count:'', weight:'', price:''}); 
        showNotify("تم البيع"); 
    };
    
    const saveExpense = () => { 
        setExpenses([...expenses, { ...newExpense, id: Date.now(), batchId: activeBatch.id }]); 
        setNewExpense({...newExpense, item:'', cost:''}); 
        showNotify("تم المصروف"); 
    };

    return (
        <div className="space-y-4 pb-20">
             <div className="flex bg-gray-200 p-1 rounded-xl">
                  <button onClick={() => setView('sales')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'sales' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>المبيعات</button>
                  <button onClick={() => setView('expenses')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'expenses' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>المصاريف</button>
             </div>
             
             {view === 'sales' && (
                 <Card>
                     <Input label="التاجر" value={newSale.buyer} onChange={e=>setNewSale({...newSale, buyer:e.target.value})}/>
                     <div className="flex gap-2">
                         <Input label="العدد" type="number" value={newSale.count} onChange={e=>setNewSale({...newSale, count:e.target.value})}/>
                         <Input label="الوزن (كجم)" type="number" value={newSale.weight} onChange={e=>setNewSale({...newSale, weight:e.target.value})}/>
                     </div>
                     <Input label="سعر الوحدة" type="number" value={newSale.price} onChange={e=>setNewSale({...newSale, price:e.target.value})}/>
                     <Button onClick={saveSale} variant="success" className="w-full">حفظ البيع</Button>
                 </Card>
             )}
             
             {view === 'expenses' && (
                 <Card>
                     <Input label="البند" value={newExpense.item} onChange={e=>setNewExpense({...newExpense, item:e.target.value})}/>
                     <Input label="التكلفة" type="number" value={newExpense.cost} onChange={e=>setNewExpense({...newExpense, cost:e.target.value})}/>
                     <Button onClick={saveExpense} variant="danger" className="w-full">حفظ المصروف</Button>
                 </Card>
             )}
             
             <div className="space-y-2 mt-4">
                 {(view === 'sales' ? sales : expenses).filter(x => x.batchId === activeBatch.id).map(x => (
                     <div key={x.id} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
                         <div>
                             <p className="font-bold text-sm">{x.buyer || x.item}</p>
                             <p className="text-gray-400">{formatDate(x.date)}</p>
                         </div>
                         <p className="font-bold text-lg">{x.total?.toLocaleString() || Number(x.cost).toLocaleString()}</p>
                     </div>
                 ))}
             </div>
        </div>
    );
  };

  // --- Render الرئيسي ---
  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className="min-h-screen bg-[#FFF7ED] font-sans text-gray-900" dir="rtl">
        {/* نافذة تأكيد الحذف */}
        <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})} title="تأكيد"> 
          <p className="text-gray-600 mb-6 text-center">{confirmDialog.title}</p> 
          <div className="flex gap-3"> 
            <Button onClick={confirmDialog.onConfirm} variant="danger" className="flex-1">نعم</Button> 
            <Button onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} variant="ghost" className="flex-1">إلغاء</Button> 
          </div> 
        </Modal>
        
        {/* الإشعارات */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold text-sm">
            {notification}
          </div>
        )}
        
        {/* الهيدر */}
        <div className="bg-white pt-safe-top pb-2 px-4 sticky top-0 z-20 shadow-sm"> 
          <div className="flex justify-between items-center max-w-md mx-auto pt-2"> 
            <h1 className="text-xl font-black text-orange-600 flex items-center gap-2">
              <Bird size={24}/> دواجني
            </h1> 
            <button onClick={downloadBackup} className="text-gray-400">
              <Download size={20}/>
            </button> 
          </div> 
        </div>
        
        {/* المحتوى الرئيسي */}
        <div className="p-4 max-w-md mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'batches' && <BatchManager />}
          {activeTab === 'daily' && <DailyOperations />}
          {activeTab === 'finance' && <Financials />}
          {activeTab === 'health' && <HealthManager />}
        </div>
        
        {/* شريط التنقل السفلي */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe shadow-lg z-30"> 
          <div className="flex justify-around p-2 max-w-md mx-auto"> 
            {[
              {id:'dashboard',icon:Activity,l:'الرئيسية'},
              {id:'daily',icon:Calendar,l:'اليوميات'},
              {id:'health',icon:Syringe,l:'الصحة'},
              {id:'finance',icon:DollarSign,l:'المالية'},
              {id:'batches',icon:PackageOpen,l:'الدورات'}
            ].map(t => (
              <button 
                key={t.id} 
                onClick={()=>setActiveTab(t.id)} 
                className={`flex flex-col items-center w-12 ${activeTab===t.id?'text-orange-600':'text-gray-400'}`}
              >
                <t.icon size={20} strokeWidth={activeTab===t.id?2.5:2}/>
                <span className="text-[9px] font-bold mt-1">{t.l}</span>
              </button>
            ))} 
          </div> 
        </div>
      </div>
    </>
  );
                                  }
