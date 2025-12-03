import React, { useState, useEffect } from 'react';
import { Bird, DollarSign, Activity, Trash2, Plus, Edit2, Share2, Wheat, TrendingUp, TrendingDown, Scale, AlertTriangle, Download, Thermometer, Calendar, Skull, PackageOpen, Syringe, CheckCircle, Clock, FileText } from 'lucide-react';
// تأكد من وجود ملف UI.jsx بنفس المسار
import { Button, Card, Input, Modal, WeightChart, formatDate, getDaysDifference } from './UI';

// دالة مساعدة لإضافة أيام على تاريخ معين
const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: () => {} });

  // --- البيانات ---
  const [batches, setBatches] = useState(() => JSON.parse(localStorage.getItem('batches')) || []);
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem('dailyLogs')) || []);
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('sales')) || []);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
  // الحالة الجديدة للتحصينات
  const [vaccinations, setVaccinations] = useState(() => JSON.parse(localStorage.getItem('vaccinations')) || []);

  const activeBatch = batches.find(b => b.status === 'active');

  useEffect(() => {
    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('vaccinations', JSON.stringify(vaccinations));
  }, [batches, dailyLogs, sales, expenses, vaccinations]);

  const showNotify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const handleDelete = (title, action) => { setConfirmDialog({ isOpen: true, title: `حذف ${title}؟`, onConfirm: () => { action(); setConfirmDialog({ ...confirmDialog, isOpen: false }); showNotify("تم الحذف"); } }); };
  const shareViaWhatsapp = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

  const downloadBackup = () => {
    const data = { batches, dailyLogs, sales, expenses, vaccinations };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const a = document.createElement('a'); a.href = dataStr; a.download = `poultry_smart_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); a.remove(); showNotify("تم حفظ النسخة الاحتياطية");
  };

  // --- 1. Dashboard ---
  const Dashboard = () => {
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
    const mortalityRate = ((totalDead / activeBatch.initialCount) * 100).toFixed(1);
    const totalFeed = batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
    const age = getDaysDifference(activeBatch.startDate);
    
    const lastWeightLog = [...batchLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).find(l => l.avgWeight);
    const currentWeight = lastWeightLog ? lastWeightLog.avgWeight : 0;
    
    // FCR Calculation (معامل التحويل)
    // FCR = العلف المستهلك / (الوزن الحالي × العدد الحالي / 1000)
    const totalBiomassKg = (currentCount * currentWeight) / 1000;
    const fcr = totalBiomassKg > 0 ? (totalFeed / totalBiomassKg).toFixed(2) : "0.00";

    const batchSales = sales.filter(s => s.batchId === activeBatch.id).reduce((sum, s) => sum + Number(s.total), 0);
    const batchExpenses = expenses.filter(e => e.batchId === activeBatch.id).reduce((sum, e) => sum + Number(e.cost), 0);

    // تنبيهات التحصين
    const todayStr = new Date().toISOString().split('T')[0];
    const dueVaccines = vaccinations.filter(v => v.batchId === activeBatch.id && v.status === 'pending' && v.date <= todayStr);

    const chartData = batchLogs.filter(l => l.avgWeight).map(l => ({ 
        day: getDaysDifference(activeBatch.startDate) - (getDaysDifference(activeBatch.startDate) - getDaysDifference(l.date)), 
        val: l.avgWeight 
    })).sort((a,b)=>a.day-b.day);

    return (
      <div className="space-y-4 pb-20 animate-fade-in">
        {/* تنبيه التحصين */}
        {dueVaccines.length > 0 && (
            <div className="bg-purple-100 border-l-4 border-purple-600 p-4 rounded-r-xl shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                    <Syringe className="text-purple-600" size={24} />
                    <div>
                        <h3 className="font-bold text-purple-800">تحصينة مستحقة اليوم!</h3>
                        <p className="text-xs text-purple-700">{dueVaccines[0].name} ({dueVaccines[0].type})</p>
                    </div>
                    <Button onClick={() => setActiveTab('health')} variant="ghost" className="mr-auto text-xs bg-white">عرض</Button>
                </div>
            </div>
        )}

        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-5 text-white shadow-xl">
           <div className="flex justify-between items-start mb-4">
              <div><h2 className="text-lg font-bold">{activeBatch.name}</h2><p className="text-xs opacity-80">عمر {age} يوم</p></div>
              <div className="bg-white/20 px-3 py-1 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-xs">FCR</p><p className="font-bold text-xl">{fcr}</p>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-2 text-center border-t border-white/20 pt-3">
               <div><p className="text-xs opacity-70">العدد</p><p className="font-bold text-lg">{currentCount}</p></div>
               <div><p className="text-xs opacity-70">النافق</p><p className="font-bold text-lg">{totalDead} <span className="text-[10px] bg-black/20 px-1 rounded">{mortalityRate}%</span></p></div>
               <div><p className="text-xs opacity-70">العلف</p><p className="font-bold text-lg">{totalFeed}</p></div>
           </div>
        </div>

        <Card>
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-gray-700 text-sm flex items-center gap-2"><Scale size={18} className="text-blue-500"/> الأوزان</h3><span className="text-sm font-bold text-blue-600">{currentWeight} جم</span></div>
            <WeightChart data={chartData} />
        </Card>

        <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 border-emerald-100 p-3"><p className="text-xs text-emerald-800 font-bold mb-1">المبيعات</p><p className="text-lg font-bold text-emerald-700">{batchSales.toLocaleString()}</p></Card>
            <Card className="bg-rose-50 border-rose-100 p-3"><p className="text-xs text-rose-800 font-bold mb-1">المصروفات</p><p className="text-lg font-bold text-rose-700">{batchExpenses.toLocaleString()}</p></Card>
        </div>
      </div>
    );
  };

  // --- 2. Health Manager (الجديد كلياً) ---
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
                      const ageAtVaccine = getDaysDifference(activeBatch.startDate) - (getDaysDifference(activeBatch.startDate) - getDaysDifference(v.date)); // حساب العمر التقريبي للتاريخ

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

  // --- 3. Batch Manager (تم تحديثه لإنشاء الجدول تلقائياً) ---
  const BatchManager = () => {
      const [view, setView] = useState('list');
      const [newBatch, setNewBatch] = useState({ name: '', startDate: new Date().toISOString().split('T')[0], initialCount: '', breed: '' });

      const generateDefaultSchedule = (batchId, startDate) => {
          const templates = [
              { day: 7, name: 'هتشنر + نيوكاسل', type: 'تقطير/رش' },
              { day: 10, name: 'أنفلونزا (H5N1)', type: 'حقن' },
              { day: 12, name: 'جامبورو (متوسط)', type: 'مياه شرب' },
              { day: 18, name: 'لاسوتا (كولون)', type: 'مياه شرب' },
              { day: 24, name: 'جامبورو (إعادة)', type: 'مياه شرب' }
          ];
          return templates.map((t, i) => ({
              id: Date.now() + i,
              batchId,
              name: t.name,
              type: t.type,
              date: addDays(startDate, t.day),
              dayAge: t.day,
              status: 'pending'
          }));
      };

      const startBatch = () => {
          if (!newBatch.name || !newBatch.initialCount) return showNotify("البيانات ناقصة");
          const batchId = Date.now();
          const updatedBatches = batches.map(b => b.status === 'active' ? {...b, status: 'closed', endDate: new Date().toISOString()} : b);
          setBatches([...updatedBatches, { ...newBatch, id: batchId, status: 'active' }]);
          
          // إنشاء الجدول تلقائياً
          const newVaccs = generateDefaultSchedule(batchId, newBatch.startDate);
          setVaccinations([...vaccinations, ...newVaccs]);

          setNewBatch({ name: '', startDate: '', initialCount: '', breed: '' });
          setView('list'); showNotify("تم بدء الدورة والجدول 💉");
      };

      return (
          <div className="space-y-4 pb-20">
              {view === 'list' && (
                  <>
                    <Button onClick={() => setView('new')} className="w-full"><Plus size={18}/> بدء دورة جديدة</Button>
                    <div className="space-y-3 mt-4">
                        {batches.map(b => (
                            <div key={b.id} className={`p-4 rounded-xl border flex justify-between items-center ${b.status === 'active' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                                <div>
                                    <p className="font-bold text-gray-800">{b.name} <span className="text-xs font-normal text-gray-500">({b.breed})</span></p>
                                    <p className="text-xs text-gray-500">{formatDate(b.startDate)} • {b.initialCount} طائر</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status === 'active' ? 'نشطة' : 'مغلقة'}</span>
                            </div>
                        ))}
                    </div>
                  </>
              )}
              {view === 'new' && (
                  <Card>
                      <h3 className="font-bold mb-4 text-center">دورة جديدة</h3>
                      <Input label="الاسم" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} />
                      <Input label="تاريخ التسكين" type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} />
                      <div className="flex gap-2">
                          <Input label="العدد" type="number" value={newBatch.initialCount} onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})} />
                          <Input label="السلالة" value={newBatch.breed} onChange={e => setNewBatch({...newBatch, breed: e.target.value})} />
                      </div>
                      <Button onClick={startBatch} className="w-full">حفظ وإنشاء الجدول</Button>
                  </Card>
              )}
          </div>
      );
  };

    // --- 3. اليوميات (محدثة: أنواع العلف وأسباب النافق) ---
  const DailyOperations = () => {
      if (!activeBatch) return null;
      
      const [view, setView] = useState('list');
      // تمت إضافة deadCause و feedType للحالة
      const [log, setLog] = useState({ date: new Date().toISOString().split('T')[0], dead: '', deadCause: 'طبيعي', feed: '', feedType: 'بادي 23%', avgWeight: '', temp: '', notes: '' });

      const saveLog = () => {
          setDailyLogs([...dailyLogs, { ...log, id: Date.now(), batchId: activeBatch.id }]);
          // إعادة تعيين الحقول
          setLog({ date: new Date().toISOString().split('T')[0], dead: '', deadCause: 'طبيعي', feed: '', feedType: 'بادي 23%', avgWeight: '', temp: '', notes: '' });
          setView('list'); 
          showNotify("تم حفظ السجل اليومي ✅");
      };

      // قوائم الاختيار
      const FEED_TYPES = ['بادي 23%', 'نامي 21%', 'ناهي 19%'];
      const DEATH_CAUSES = ['طبيعي', 'سموم فطرية', 'إجهاد حراري', 'أمراض تنفسية', 'كوكسيديا', 'سردة/فرزة', 'أخرى'];

      return (
          <div className="space-y-4 pb-20">
              <div className="flex p-1 bg-gray-200 rounded-xl">
                  <button onClick={() => setView('list')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>السجل</button>
                  <button onClick={() => setView('new')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'new' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>تسجيل جديد</button>
              </div>

              {view === 'new' && (
                  <Card className="animate-slide-up">
                      <Input label="التاريخ" type="date" value={log.date} onChange={e => setLog({...log, date: e.target.value})} />
                      
                      {/* قسم النافق المطور */}
                      <div className="bg-red-50 p-3 rounded-xl mb-3 border border-red-100">
                          <label className="text-xs font-bold text-red-800 block mb-2 flex items-center gap-1"><Skull size={14}/> النافق</label>
                          <div className="flex gap-2">
                              <input type="number" className="flex-1 p-2 rounded border border-red-200" value={log.dead} onChange={e => setLog({...log, dead: e.target.value})} placeholder="العدد" />
                              <select className="flex-1 p-2 rounded border border-red-200 text-xs bg-white" value={log.deadCause} onChange={e => setLog({...log, deadCause: e.target.value})}>
                                  {DEATH_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>
                      </div>

                      {/* قسم العلف المطور */}
                      <div className="bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                          <label className="text-xs font-bold text-amber-800 block mb-2 flex items-center gap-1"><Wheat size={14}/> استهلاك العلف</label>
                          <div className="flex gap-2">
                              <input type="number" className="flex-1 p-2 rounded border border-amber-200" value={log.feed} onChange={e => setLog({...log, feed: e.target.value})} placeholder="الكمية (كجم)" />
                              <select className="flex-1 p-2 rounded border border-amber-200 text-xs bg-white" value={log.feedType} onChange={e => setLog({...log, feedType: e.target.value})}>
                                  {FEED_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                          <Input label="متوسط الوزن (جم)" type="number" value={log.avgWeight} onChange={e => setLog({...log, avgWeight: e.target.value})} />
                          <Input label="الحرارة °C" type="number" value={log.temp} onChange={e => setLog({...log, temp: e.target.value})} />
                      </div>
                      
                      <Input label="ملاحظات" value={log.notes} onChange={e => setLog({...log, notes: e.target.value})} />
                      <Button onClick={saveLog} className="w-full mt-2">حفظ البيانات</Button>
                  </Card>
              )}

              {view === 'list' && (
                  <div className="space-y-2">
                      {dailyLogs.filter(l => l.batchId === activeBatch.id).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(l => (
                          <div key={l.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs">
                              <div className="flex justify-between font-bold text-gray-800 mb-2 border-b pb-1">
                                  <span>{formatDate(l.date)}</span>
                                  {l.dead > 0 && <span className="text-red-600">نافق: {l.dead} ({l.deadCause})</span>}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-gray-500">
                                  <div><p>علف ({l.feedType})</p><p className="font-bold text-amber-600">{l.feed} كجم</p></div>
                                  <div><p>وزن</p><p className="font-bold text-blue-600">{l.avgWeight || '-'} جم</p></div>
                                  <div><p>حرارة</p><p className="font-bold text-gray-600">{l.temp || '-'}°</p></div>
                              </div>
                              <button onClick={() => handleDelete('سجل', () => setDailyLogs(dailyLogs.filter(d => d.id !== l.id)))} className="text-red-400 mt-2 w-full text-right"><Trash2 size={14}/></button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  const Financials = () => {
    if (!activeBatch) return null;
    const [view, setView] = useState('sales');
    const [newSale, setNewSale] = useState({ buyer: '', count: '', weight: '', price: '', date: new Date().toISOString().split('T')[0] });
    const [newExpense, setNewExpense] = useState({ item: '', cost: '', date: new Date().toISOString().split('T')[0] });

    const saveSale = () => { const total = Number(newSale.weight || newSale.count) * Number(newSale.price); setSales([...sales, { ...newSale, total, id: Date.now(), batchId: activeBatch.id }]); setNewSale({...newSale, buyer:'', count:'', weight:'', price:''}); showNotify("تم البيع"); };
    const saveExpense = () => { setExpenses([...expenses, { ...newExpense, id: Date.now(), batchId: activeBatch.id }]); setNewExpense({...newExpense, item:'', cost:''}); showNotify("تم المصروف"); };

    return (
        <div className="space-y-4 pb-20">
             <div className="flex bg-gray-200 p-1 rounded-xl">
                  <button onClick={() => setView('sales')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'sales' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>المبيعات</button>
                  <button onClick={() => setView('expenses')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'expenses' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>المصاريف</button>
             </div>
             {view === 'sales' && <Card><Input label="التاجر" value={newSale.buyer} onChange={e=>setNewSale({...newSale, buyer:e.target.value})}/><div className="flex gap-2"><Input label="العدد" type="number" value={newSale.count} onChange={e=>setNewSale({...newSale, count:e.target.value})}/><Input label="الوزن (كجم)" type="number" value={newSale.weight} onChange={e=>setNewSale({...newSale, weight:e.target.value})}/></div><Input label="سعر الوحدة" type="number" value={newSale.price} onChange={e=>setNewSale({...newSale, price:e.target.value})}/><Button onClick={saveSale} variant="success" className="w-full">حفظ البيع</Button></Card>}
             {view === 'expenses' && <Card><Input label="البند" value={newExpense.item} onChange={e=>setNewExpense({...newExpense, item:e.target.value})}/><Input label="التكلفة" type="number" value={newExpense.cost} onChange={e=>setNewExpense({...newExpense, cost:e.target.value})}/><Button onClick={saveExpense} variant="danger" className="w-full">حفظ المصروف</Button></Card>}
             
             <div className="space-y-2 mt-4">
                 {(view === 'sales' ? sales : expenses).filter(x => x.batchId === activeBatch.id).map(x => (
                     <div key={x.id} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
                         <div><p className="font-bold text-sm">{x.buyer || x.item}</p><p className="text-gray-400">{formatDate(x.date)}</p></div>
                         <p className="font-bold text-lg">{x.total?.toLocaleString() || Number(x.cost).toLocaleString()}</p>
                     </div>
                 ))}
             </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] font-sans text-gray-900" dir="rtl">
      <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})} title="تأكيد"> <p className="text-gray-600 mb-6 text-center">{confirmDialog.title}</p> <div className="flex gap-3"> <Button onClick={confirmDialog.onConfirm} variant="danger" className="flex-1">نعم</Button> <Button onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} variant="ghost" className="flex-1">إلغاء</Button> </div> </Modal>
      {notification && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold text-sm">{notification}</div>}
      <div className="bg-white pt-safe-top pb-2 px-4 sticky top-0 z-20 shadow-sm"> <div className="flex justify-between items-center max-w-md mx-auto pt-2"> <h1 className="text-xl font-black text-orange-600 flex items-center gap-2"><Bird size={24}/> دواجني</h1> <button onClick={downloadBackup} className="text-gray-400"><Download size={20}/></button> </div> </div>
      <div className="p-4 max-w-md mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'batches' && <BatchManager />}
        {activeTab === 'daily' && <DailyOperations />}
        {activeTab === 'finance' && <Financials />}
        {activeTab === 'health' && <HealthManager />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe shadow-lg z-30"> <div className="flex justify-around p-2 max-w-md mx-auto"> {[{id:'dashboard',icon:Activity,l:'الرئيسية'},{id:'daily',icon:Calendar,l:'اليوميات'},{id:'health',icon:Syringe,l:'الصحة'},{id:'finance',icon:DollarSign,l:'المالية'},{id:'batches',icon:PackageOpen,l:'الدورات'}].map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex flex-col items-center w-12 ${activeTab===t.id?'text-orange-600':'text-gray-400'}`}><t.icon size={20} strokeWidth={activeTab===t.id?2.5:2}/><span className="text-[9px] font-bold mt-1">{t.l}</span></button>)} </div> </div>
    </div>
  );
}
