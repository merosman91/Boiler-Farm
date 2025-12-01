import React, { useState, useEffect } from 'react';
import { Bird, DollarSign, Activity, Trash2, Plus, Edit2, Share2, Wheat, TrendingUp, TrendingDown, Scale, AlertTriangle, Download, Thermometer, Calendar, Skull, PackageOpen } from 'lucide-react';
import { Button, Card, Input, Modal, WeightChart, formatDate, getDaysDifference } from './UI';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: () => {} });

  // --- البيانات ---
  // batches: الدورات (مثلاً دورة شهر 12)
  const [batches, setBatches] = useState(() => JSON.parse(localStorage.getItem('batches')) || []);
  // dailyLogs: اليوميات (نافق، علف، وزن، حرارة لكل يوم)
  const [dailyLogs, setDailyLogs] = useState(() => JSON.parse(localStorage.getItem('dailyLogs')) || []);
  // sales: المبيعات
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem('sales')) || []);
  // expenses: المصاريف الإضافية (أدوية، نشارة، غاز)
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);

  // الدورة النشطة حالياً
  const activeBatch = batches.find(b => b.status === 'active');

  useEffect(() => {
    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [batches, dailyLogs, sales, expenses]);

  const showNotify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const handleDelete = (title, action) => { setConfirmDialog({ isOpen: true, title: `حذف ${title}؟`, onConfirm: () => { action(); setConfirmDialog({ ...confirmDialog, isOpen: false }); showNotify("تم الحذف"); } }); };
  const shareViaWhatsapp = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

  const downloadBackup = () => {
    const data = { batches, dailyLogs, sales, expenses };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const a = document.createElement('a'); a.href = dataStr; a.download = `poultry_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); a.remove(); showNotify("تم حفظ النسخة الاحتياطية");
  };

  // --- 1. لوحة التحكم (Dashboard) ---
  const Dashboard = () => {
    if (!activeBatch) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <Bird size={64} className="text-gray-300 mb-4"/>
            <h2 className="text-xl font-bold text-gray-700">لا توجد دورة نشطة</h2>
            <p className="text-gray-500 mb-6">ابدأ دورة جديدة لتسجيل البيانات</p>
            <Button onClick={() => setActiveTab('batches')}>بدء دورة جديدة</Button>
        </div>
    );

    // الحسابات
    const batchLogs = dailyLogs.filter(l => l.batchId === activeBatch.id);
    const totalDead = batchLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
    const currentCount = activeBatch.initialCount - totalDead;
    const mortalityRate = ((totalDead / activeBatch.initialCount) * 100).toFixed(1);
    const totalFeed = batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0); // بالكيلو او الشيكارة
    const age = getDaysDifference(activeBatch.startDate);
    
    // آخر وزن مسجل
    const lastWeightLog = [...batchLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).find(l => l.avgWeight);
    const currentWeight = lastWeightLog ? lastWeightLog.avgWeight : 0;

    // المالية للدورة الحالية
    const batchSales = sales.filter(s => s.batchId === activeBatch.id).reduce((sum, s) => sum + Number(s.total), 0);
    const batchExpenses = expenses.filter(e => e.batchId === activeBatch.id).reduce((sum, e) => sum + Number(e.cost), 0);
    // تكلفة العلف تقريبية (يمكن تطويرها)
    const profit = batchSales - batchExpenses;

    const chartData = batchLogs.filter(l => l.avgWeight).map(l => ({ 
        day: getDaysDifference(activeBatch.startDate) - (getDaysDifference(l.date) === 0 ? 0 : getDaysDifference(activeBatch.startDate) - getDaysDifference(l.date)), // تبسيط للأيام
        val: l.avgWeight 
    })).sort((a,b)=>a.day-b.day);

    return (
      <div className="space-y-4 pb-20 animate-fade-in">
        {/* ملخص الدورة */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-5 text-white shadow-xl">
           <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-lg font-bold">{activeBatch.name}</h2>
                  <p className="text-xs opacity-80">تاريخ التسكين: {formatDate(activeBatch.startDate)}</p>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-lg text-center backdrop-blur-sm">
                  <p className="text-xs">العمر</p>
                  <p className="font-bold text-xl">{age} <span className="text-[10px]">يوم</span></p>
              </div>
           </div>
           
           <div className="grid grid-cols-3 gap-2 text-center border-t border-white/20 pt-3">
               <div>
                   <p className="text-xs opacity-70">العدد الحالي</p>
                   <p className="font-bold text-lg">{currentCount}</p>
               </div>
               <div>
                   <p className="text-xs opacity-70">النافق الكلي</p>
                   <p className="font-bold text-lg flex items-center justify-center gap-1">{totalDead} <span className="text-[10px] bg-red-500/80 px-1 rounded">{mortalityRate}%</span></p>
               </div>
               <div>
                   <p className="text-xs opacity-70">استهلاك العلف</p>
                   <p className="font-bold text-lg">{totalFeed} <span className="text-[10px]">كجم</span></p>
               </div>
           </div>
        </div>

        {/* الوزن والتحويل */}
        <Card>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2"><Scale size={18} className="text-blue-500"/> تطور الوزن</h3>
                <span className="text-sm font-bold text-blue-600">{currentWeight} جرام</span>
            </div>
            <WeightChart data={chartData} />
            <p className="text-[10px] text-gray-400 text-center mt-2">* الوزن المثالي لهذا العمر: متغير حسب السلالة</p>
        </Card>

        {/* المالية المختصرة */}
        <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 border-emerald-100 p-3">
                <p className="text-xs text-emerald-800 font-bold mb-1">المبيعات</p>
                <p className="text-lg font-bold text-emerald-700">{batchSales.toLocaleString()}</p>
            </Card>
            <Card className="bg-rose-50 border-rose-100 p-3">
                <p className="text-xs text-rose-800 font-bold mb-1">المصروفات</p>
                <p className="text-lg font-bold text-rose-700">{batchExpenses.toLocaleString()}</p>
            </Card>
        </div>

        <Button onClick={() => shareViaWhatsapp(`تقرير الدورة ${activeBatch.name}\nالعمر: ${age} يوم\nالعدد: ${currentCount}\nالنافق: ${totalDead} (${mortalityRate}%)\nمتوسط الوزن: ${currentWeight}g`)} variant="dark" className="w-full">
            <Share2 size={16}/> مشاركة التقرير اليومي
        </Button>
      </div>
    );
  };

  // --- 2. إدارة الدورات (Batches) ---
  const BatchManager = () => {
      const [view, setView] = useState('list');
      const [newBatch, setNewBatch] = useState({ name: '', startDate: '', initialCount: '', breed: '' });

      const startBatch = () => {
          if (!newBatch.name || !newBatch.initialCount) return showNotify("البيانات ناقصة");
          // إغلاق أي دورة نشطة سابقة
          const updatedBatches = batches.map(b => b.status === 'active' ? {...b, status: 'closed', endDate: new Date().toISOString()} : b);
          setBatches([...updatedBatches, { ...newBatch, id: Date.now(), status: 'active' }]);
          setNewBatch({ name: '', startDate: '', initialCount: '', breed: '' });
          setView('list'); showNotify("تم بدء الدورة بنجاح 🐣");
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
                                    <p className="text-xs text-gray-500">{formatDate(b.startDate)} • العدد: {b.initialCount}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {b.status === 'active' ? 'نشطة' : 'مغلقة'}
                                </span>
                            </div>
                        ))}
                    </div>
                  </>
              )}
              {view === 'new' && (
                  <Card>
                      <h3 className="font-bold mb-4 text-center">بيانات الدورة الجديدة</h3>
                      <Input label="اسم الدورة (مثلاً: دورة رمضان)" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} />
                      <Input label="تاريخ التسكين" type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} />
                      <div className="flex gap-2">
                          <Input label="العدد المبدئي" type="number" value={newBatch.initialCount} onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})} />
                          <Input label="السلالة (كب، روس..)" value={newBatch.breed} onChange={e => setNewBatch({...newBatch, breed: e.target.value})} />
                      </div>
                      <Button onClick={startBatch} className="w-full">حفظ وبدء</Button>
                  </Card>
              )}
          </div>
      );
  };

  // --- 3. اليوميات (Daily Logs) - قلب التطبيق ---
  const DailyOperations = () => {
      if (!activeBatch) return <p className="text-center text-gray-500 py-10">يجب بدء دورة أولاً</p>;
      
      const [view, setView] = useState('list');
      const [log, setLog] = useState({ date: new Date().toISOString().split('T')[0], dead: '', feed: '', avgWeight: '', temp: '', notes: '' });

      const saveLog = () => {
          setDailyLogs([...dailyLogs, { ...log, id: Date.now(), batchId: activeBatch.id }]);
          setLog({ date: new Date().toISOString().split('T')[0], dead: '', feed: '', avgWeight: '', temp: '', notes: '' });
          setView('list'); showNotify("تم تسجيل اليوميات");
      };

      const currentLogs = dailyLogs.filter(l => l.batchId === activeBatch.id).sort((a,b) => new Date(b.date) - new Date(a.date));

      return (
          <div className="space-y-4 pb-20">
              <div className="flex p-1 bg-gray-200 rounded-xl">
                  <button onClick={() => setView('list')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>السجل</button>
                  <button onClick={() => setView('new')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'new' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>تسجيل جديد</button>
              </div>

              {view === 'new' && (
                  <Card className="animate-slide-up">
                      <Input label="التاريخ" type="date" value={log.date} onChange={e => setLog({...log, date: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-red-50 p-2 rounded-xl">
                              <label className="text-xs font-bold text-red-800 flex items-center gap-1 mb-1"><Skull size={14}/> النافق (عدد)</label>
                              <input type="number" className="w-full p-2 rounded border border-red-200" value={log.dead} onChange={e => setLog({...log, dead: e.target.value})} placeholder="0" />
                          </div>
                          <div className="bg-amber-50 p-2 rounded-xl">
                              <label className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1"><Wheat size={14}/> العلف (كجم)</label>
                              <input type="number" className="w-full p-2 rounded border border-amber-200" value={log.feed} onChange={e => setLog({...log, feed: e.target.value})} placeholder="0" />
                          </div>
                          <div className="bg-blue-50 p-2 rounded-xl">
                              <label className="text-xs font-bold text-blue-800 flex items-center gap-1 mb-1"><Scale size={14}/> متوسط الوزن (جم)</label>
                              <input type="number" className="w-full p-2 rounded border border-blue-200" value={log.avgWeight} onChange={e => setLog({...log, avgWeight: e.target.value})} placeholder="مثلاً: 1500" />
                          </div>
                          <div className="bg-gray-50 p-2 rounded-xl">
                              <label className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-1"><Thermometer size={14}/> الحرارة</label>
                              <input type="number" className="w-full p-2 rounded border border-gray-200" value={log.temp} onChange={e => setLog({...log, temp: e.target.value})} placeholder="°C" />
                          </div>
                      </div>
                      <Input label="ملاحظات / أدوية" value={log.notes} onChange={e => setLog({...log, notes: e.target.value})} className="mt-2" />
                      <Button onClick={saveLog} className="w-full mt-3">حفظ السجل اليومي</Button>
                  </Card>
              )}

              {view === 'list' && (
                  <div className="space-y-2">
                      {currentLogs.map(l => (
                          <div key={l.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                              <div className="flex justify-between items-center border-b pb-2">
                                  <span className="font-bold text-gray-800">{formatDate(l.date)}</span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">عمر {getDaysDifference(l.date) - getDaysDifference(activeBatch.startDate) + 1} يوم</span>
                              </div>
                              <div className="flex justify-between text-xs text-center">
                                  <div><p className="text-gray-400">نافق</p><p className="font-bold text-red-600">{l.dead || 0}</p></div>
                                  <div><p className="text-gray-400">علف</p><p className="font-bold text-amber-600">{l.feed || 0}</p></div>
                                  <div><p className="text-gray-400">وزن</p><p className="font-bold text-blue-600">{l.avgWeight || '-'}</p></div>
                                  <div><p className="text-gray-400">حرارة</p><p className="font-bold text-gray-600">{l.temp || '-'}</p></div>
                              </div>
                              {l.notes && <p className="text-xs bg-yellow-50 p-2 rounded text-gray-600 mt-1">{l.notes}</p>}
                              <button onClick={() => handleDelete("سجل", () => setDailyLogs(dailyLogs.filter(d => d.id !== l.id)))} className="text-red-400 self-end"><Trash2 size={14}/></button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  };

  // --- 4. المالية (المبيعات والمصروفات) ---
  const Financials = () => {
    if (!activeBatch) return <p className="text-center text-gray-500 py-10">يجب بدء دورة أولاً</p>;
    const [view, setView] = useState('sales'); // sales, expenses
    const [newSale, setNewSale] = useState({ buyer: '', count: '', weight: '', price: '', date: new Date().toISOString().split('T')[0] });
    const [newExpense, setNewExpense] = useState({ item: '', cost: '', date: new Date().toISOString().split('T')[0] });

    const saveSale = () => {
        const total = Number(newSale.weight || newSale.count) * Number(newSale.price); // حساب تقريبي
        setSales([...sales, { ...newSale, total, id: Date.now(), batchId: activeBatch.id }]);
        setNewSale({ buyer: '', count: '', weight: '', price: '', date: new Date().toISOString().split('T')[0] });
        showNotify("تم تسجيل البيع");
    };

    const saveExpense = () => {
        setExpenses([...expenses, { ...newExpense, id: Date.now(), batchId: activeBatch.id }]);
        setNewExpense({ item: '', cost: '', date: new Date().toISOString().split('T')[0] });
        showNotify("تم تسجيل المصروف");
    };

    return (
        <div className="space-y-4 pb-20">
             <div className="flex bg-gray-200 p-1 rounded-xl">
                  <button onClick={() => setView('sales')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'sales' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>المبيعات</button>
                  <button onClick={() => setView('expenses')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'expenses' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}>المصاريف</button>
             </div>

             {view === 'sales' && (
                 <>
                    <Card className="mb-4">
                        <h3 className="font-bold text-sm mb-3 text-emerald-700">بيع دجاج (لحم)</h3>
                        <Input label="التاجر" value={newSale.buyer} onChange={e => setNewSale({...newSale, buyer: e.target.value})} />
                        <div className="flex gap-2">
                            <Input label="العدد" type="number" value={newSale.count} onChange={e => setNewSale({...newSale, count: e.target.value})} />
                            <Input label="الوزن القائم (كجم)" type="number" value={newSale.weight} onChange={e => setNewSale({...newSale, weight: e.target.value})} />
                        </div>
                        <Input label="سعر الكيلو/العدد" type="number" value={newSale.price} onChange={e => setNewSale({...newSale, price: e.target.value})} />
                        <Button onClick={saveSale} variant="success" className="w-full">تسجيل البيع</Button>
                    </Card>
                    <div className="space-y-2">
                        {sales.filter(s => s.batchId === activeBatch.id).map(s => (
                            <div key={s.id} className="bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center">
                                <div><p className="font-bold">{s.buyer}</p><p className="text-xs text-gray-500">{s.count} دجاجة • {s.weight} كجم</p></div>
                                <p className="font-bold text-emerald-600">{s.total.toLocaleString()} ج.س</p>
                            </div>
                        ))}
                    </div>
                 </>
             )}

             {view === 'expenses' && (
                 <>
                    <Card className="mb-4">
                        <h3 className="font-bold text-sm mb-3 text-rose-700">مصروفات تشغيلية (نشارة، أدوية...)</h3>
                        <Input label="البند" value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} />
                        <Input label="التكلفة" type="number" value={newExpense.cost} onChange={e => setNewExpense({...newExpense, cost: e.target.value})} />
                        <Button onClick={saveExpense} variant="danger" className="w-full">تسجيل المصروف</Button>
                    </Card>
                    <div className="space-y-2">
                        {expenses.filter(e => e.batchId === activeBatch.id).map(e => (
                            <div key={e.id} className="bg-white p-3 rounded-xl border border-rose-100 flex justify-between items-center">
                                <span className="font-bold text-gray-700">{e.item}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-rose-600">{Number(e.cost).toLocaleString()}</span>
                                    <button onClick={() => handleDelete('مصروف', () => setExpenses(expenses.filter(x => x.id !== e.id)))}><Trash2 size={14} className="text-gray-400"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </>
             )}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] font-sans text-gray-900" dir="rtl">
      <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})} title="تأكيد"> <p className="text-gray-600 mb-6 text-center">{confirmDialog.title}</p> <div className="flex gap-3"> <Button onClick={confirmDialog.onConfirm} variant="danger" className="flex-1">نعم</Button> <Button onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} variant="ghost" className="flex-1">إلغاء</Button> </div> </Modal>
      {notification && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold text-sm">{notification}</div>}
      
      {/* Header */}
      <div className="bg-white pt-safe-top pb-2 px-4 sticky top-0 z-20 shadow-sm"> 
          <div className="flex justify-between items-center max-w-md mx-auto pt-2"> 
              <h1 className="text-xl font-black text-orange-600 flex items-center gap-2"><Bird size={24}/> دواجني</h1> 
              <button onClick={downloadBackup} className="text-gray-400"><Download size={20}/></button>
          </div> 
      </div>

      <div className="p-4 max-w-md mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'batches' && <BatchManager />}
        {activeTab === 'daily' && <DailyOperations />}
        {activeTab === 'finance' && <Financials />}
      </div>

      {/* Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe shadow-lg z-30"> 
          <div className="flex justify-around p-2 max-w-md mx-auto"> 
              {[{id:'dashboard',icon:Activity,l:'الرئيسية'},{id:'daily',icon:Calendar,l:'اليوميات'},{id:'finance',icon:DollarSign,l:'المالية'},{id:'batches',icon:PackageOpen,l:'الدورات'}].map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex flex-col items-center w-12 ${activeTab===t.id?'text-orange-600':'text-gray-400'}`}><t.icon size={20} strokeWidth={activeTab===t.id?2.5:2}/><span className="text-[9px] font-bold mt-1">{t.l}</span></button>)} 
          </div> 
      </div>
    </div>
  );
}
 
