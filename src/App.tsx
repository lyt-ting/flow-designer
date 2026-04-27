import React, { useState, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
// 匯入所有 Lucide 圖示以支援手動輸入名稱自動帶出
import * as LucideIcons from 'lucide-react';
import { 
  Plus, Trash2, ChevronRight, ChevronDown, CheckCircle2, Layout, Type, AlignLeft, 
  Loader2, Palette, Search, Columns, Rows, AlignCenter, AlignRight, Maximize2, X, Hash, MessageSquareText, Edit3,
  Bold, Italic, Type as TypeIcon, Image as ImageIconLucide, Info,
  FileText, ClipboardCheck, Briefcase, Calendar, Printer, Mail, Bell, PenTool, TrendingUp, Target, PieChart,
  Users, UserPlus, MessageSquare, Megaphone, Smile, ThumbsUp, Heart, Handshake,
  Settings, Database, Server, Cpu, Code, Laptop, Wifi, Lock, ShieldCheck,
  Activity, Zap, Clock, Timer, AlertCircle, Check, Rocket, Truck, Globe, Clipboard, ShoppingCart,
  FileSignature, Eye, EyeOff, CornerDownRight, Link, ExternalLink
} from 'lucide-react';

/**
 * 推薦圖示清單
 */
const RECOMMEND_ICONS = [
  'FileText', 'ClipboardCheck', 'Briefcase', 'Calendar', 'Printer', 'Mail', 'Bell', 'PenTool', 'Search',
  'TrendingUp', 'Target', 'PieChart',
  'Users', 'UserPlus', 'MessageSquare', 'Megaphone', 'Smile', 'ThumbsUp', 'Heart', 'Handshake',
  'Settings', 'Database', 'Server', 'Cpu', 'Code', 'Laptop', 'Wifi', 'Lock', 'ShieldCheck',
  'Activity', 'Zap', 'Clock', 'Timer', 'AlertCircle', 'Check', 'Rocket', 'Truck', 'Globe', 'Coffee', 'Music', 'MapPin'
];

/**
 * 智慧圖示渲染組件
 */
const SafeIcon = ({ name, className, size = 18 }: { name: string, className?: string, size?: number }) => {
  if (!name) return <LucideIcons.Info className={className} size={size} />;
  const formatName = (str: string) => {
    return str
      .split('-')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join('');
  };
  const IconComponent = (LucideIcons as any)[name] || (LucideIcons as any)[formatName(name)] || LucideIcons.Info;
  return <IconComponent className={className} size={size} />;
};

export default function App() {
  const [globalColor, setGlobalColor] = useState('#4f46e5');
  const [orientation, setOrientation] = useState('horizontal'); 
  const [unifyWidth, setUnifyWidth] = useState(false);
  const [globalStepWidth, setGlobalStepWidth] = useState(220);
  const [showDetails, setShowDetails] = useState(true); // 是否顯示詳細卡片
  const [iconSearch, setIconSearch] = useState('');
  
  const [footerNote, setFooterNote] = useState({
    text: '※ 本流程僅供參考，實際請依最新公告為準',
    size: 10,
    color: '#94a3b8',
    bold: true,
    italic: false
  });

  const [typography, setTypography] = useState({
    node: { size: 15, bold: true, italic: false },
    label: { size: 12, bold: true, italic: false },
    title: { size: 19, bold: true, italic: false },
    desc: { size: 15, bold: false, italic: false }
  });

  const [steps, setSteps] = useState([
    {
      id: '1',
      shortTitle: '新步驟',
      customStepLabel: '', 
      fullTitle: '詳細標題',
      description: '請輸入內容...',
      icon: 'Calendar',
      active: true,
      useCustomColor: false,
      customColor: '#4f46e5',
      textAlign: 'center',
      width: 220,
      breakAfter: false,
      showConnector: true // 預設顯示接續符號
    },
    {
      id: '2',
      shortTitle: '新步驟',
      customStepLabel: '',
      fullTitle: '詳細標題',
      description: '請輸入內容...',
      icon: 'FileText',
      active: true,
      useCustomColor: false,
      customColor: '#4f46e5',
      textAlign: 'center',
      width: 220,
      breakAfter: true, // 預設第二步後分行
      showConnector: true 
    },
    {
      id: '3',
      shortTitle: '新步驟',
      customStepLabel: '',
      fullTitle: '詳細標題',
      description: '請輸入內容...',
      icon: 'ShieldCheck',
      active: true,
      useCustomColor: false,
      customColor: '#4f46e5',
      textAlign: 'center',
      width: 220,
      breakAfter: false,
      showConnector: true
    }
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const addStep = () => {
    setSteps([...steps, {
      id: Date.now().toString(),
      shortTitle: `新步驟`,
      customStepLabel: '',
      fullTitle: `詳細標題`,
      description: '請輸入內容...',
      icon: 'Info',
      active: false,
      useCustomColor: false,
      customColor: globalColor,
      textAlign: 'center',
      width: 220,
      breakAfter: false,
      showConnector: true
    }]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: string, value: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleActive = (id: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const updateTypography = (area: keyof typeof typography | 'footer', field: string, value: any) => {
    setTypography(prev => ({ ...prev, [area as keyof typeof typography]: { ...(prev[area as keyof typeof typography] as any), [field]: value } }));
  };

  const updateFooterNote = (field: string, value: any) => {
    setFooterNote(prev => ({ ...prev, [field]: value }));
  };

  // 取得所有 Lucide 圖示名稱
  const allLucideIconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(key => 
      // 過濾掉內部屬性，保留圖示組件 (大寫開頭)
      /^[A-Z]/.test(key) && (typeof (LucideIcons as any)[key] === 'function' || typeof (LucideIcons as any)[key] === 'object')
    );
  }, []);

  const filteredIcons = useMemo(() => {
    const term = iconSearch.toLowerCase();
    
    // 如果沒有搜尋詞，顯示推薦清單
    if (!term) return RECOMMEND_ICONS;
    
    // 在所有圖示中搜尋
    const filtered = allLucideIconNames.filter(name => 
      name.toLowerCase().includes(term)
    );
    
    // 回傳搜尋結果前 60 個，以免渲染過多造成卡頓
    return filtered.slice(0, 60);
  }, [iconSearch, allLucideIconNames]);

  const exportAsPng = async () => {
    if (!previewRef.current) {
      return;
    }
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const node = previewRef.current;
      const dataUrl = await toPng(node, {
        backgroundColor: '#f8fafc',
        pixelRatio: 2,
        style: { margin: '0', padding: '40px' }
      });
      const link = document.createElement('a');
      link.download = `流程圖_${new Date().getTime()}.png`;
      link.href = dataUrl; 
      link.click();
    } catch (e) {
      console.error("下載失敗:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const TypographyControl = ({ label, area, currentStyle, updateFn }: any) => {
    const style = currentStyle || (typography as any)[area];
    const updater = updateFn || ((f: string, v: any) => updateTypography(area, f, v));
    
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-white/60 rounded-xl border border-slate-100 shadow-sm">
        <span className="text-[13px] font-bold text-slate-600 uppercase truncate flex-1">{label}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-inner">
            <input 
              type="number" min="8" max="100"
              value={style.size}
              onChange={(e) => updater('size', Number(e.target.value))}
              className="w-10 text-[14px] font-mono text-slate-700 outline-none bg-transparent"
            />
            <span className="text-[11px] text-slate-400 font-bold ml-1">px</span>
          </div>
          <div className="flex gap-1.5 border-l pl-2 border-slate-200">
            <button 
              onClick={() => updater('bold', !style.bold)} 
              className={`p-2 rounded-lg transition-all ${style.bold ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Bold size={14} />
            </button>
            <button 
              onClick={() => updater('italic', !style.italic)} 
              className={`p-2 rounded-lg transition-all ${style.italic ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Italic size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PRESET_THEMES = [
    { id: 'indigo', hex: '#4f46e5', name: '靛藍' },
    { id: 'emerald', hex: '#059669', name: '翡翠' },
    { id: 'rose', hex: '#e11d48', name: '玫瑰' },
    { id: 'amber', hex: '#d97706', name: '琥珀' },
    { id: 'sky', hex: '#0284c7', name: '天空' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* 側邊欄 */}
      <div className="w-full md:w-[380px] bg-white border-r border-slate-200 p-6 overflow-y-auto shadow-xl z-10 print:hidden h-screen scroll-smooth">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20" style={{ backgroundColor: globalColor }}>
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight italic text-indigo-600">流程圖產生器</h1>
        </div>

        <div className="space-y-6 mb-8">
          {/* 佈局設定 */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-500"><Columns size={16} /><span className="text-sm font-bold uppercase tracking-widest">佈局設定</span></div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setOrientation('horizontal')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all border ${orientation === 'horizontal' ? 'bg-white shadow-md border-indigo-200 text-indigo-600' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/50'}`}><Rows size={16} className="rotate-90" /> 橫向</button>
              <button onClick={() => setOrientation('vertical')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all border ${orientation === 'vertical' ? 'bg-white shadow-md border-indigo-200 text-indigo-600' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/50'}`}><Rows size={16} /> 縱向</button>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-slate-200/50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={unifyWidth} onChange={(e) => setUnifyWidth(e.target.checked)} className="rounded focus:ring-0 w-4 h-4" style={{ color: globalColor }} />
                  <span className="text-[13px] font-bold uppercase group-hover:text-indigo-600 transition-colors">統一框寬度</span>
                </label>
                {unifyWidth && (
                  <div className="flex items-center bg-white border border-slate-200 rounded-md px-2 py-1 ml-auto shadow-inner">
                    <input type="number" value={globalStepWidth} onChange={(e) => setGlobalStepWidth(Number(e.target.value))} className="w-10 text-[13px] font-mono outline-none text-center" />
                    <span className="text-[11px] text-slate-300 ml-1">px</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} className="rounded focus:ring-0 w-4 h-4" style={{ color: globalColor }} />
                  <span className="text-[13px] font-bold uppercase group-hover:text-indigo-600 transition-colors">顯示詳細說明卡片</span>
                </label>
                {showDetails ? <Eye size={16} className="text-indigo-600" /> : <EyeOff size={16} className="text-slate-300" />}
              </div>

              {/* 插入 Icon 搜尋連結 */}
              <div className="pt-3 mt-1 border-t border-slate-200/50">
                <a 
                  href="https://lucide.dev/icons/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-colors group p-2 rounded-lg hover:bg-indigo-50/50"
                >
                  <Search size={14} className="group-hover:scale-110 transition-transform text-indigo-400" />
                  <span>查詢 Lucide 圖示名稱</span>
                  <ExternalLink size={12} className="ml-auto opacity-40 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>

          {/* 字體樣式設定 */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1 text-slate-500"><TypeIcon size={16} /><span className="text-sm font-bold uppercase tracking-widest">字體樣式設定</span></div>
            <TypographyControl label="1. 流程框文字" area="node" />
            <TypographyControl label="2. 步驟標籤" area="label" />
            {showDetails && (
              <>
                <TypographyControl label="3. 卡片大標題" area="title" />
                <TypographyControl label="4. 卡片詳細描述" area="desc" />
              </>
            )}
          </div>

          {/* 頁尾備註設定 */}
          <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileSignature size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">頁尾備註設定</span>
            </div>
            <textarea 
              value={footerNote.text}
              onChange={(e) => updateFooterNote('text', e.target.value)}
              placeholder="輸入備註文字..."
              className="w-full p-4 text-[13px] bg-white border border-indigo-100 rounded-xl shadow-inner focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none min-h-[80px]"
            />
            <div className="space-y-3">
               <TypographyControl 
                  label="備註字體控制" 
                  area="footer" 
                  currentStyle={footerNote} 
                  updateFn={updateFooterNote} 
               />
               <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-slate-100 shadow-sm">
                  <span className="text-[13px] font-bold text-slate-600 uppercase">備註顏色</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={footerNote.color} 
                      onChange={(e) => updateFooterNote('color', e.target.value)}
                      className="w-20 px-2 py-1.5 text-[12px] font-mono bg-white border border-slate-200 rounded uppercase outline-none" 
                    />
                    <input 
                      type="color" 
                      value={footerNote.color} 
                      onChange={(e) => updateFooterNote('color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm" 
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* 色彩設定 */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 text-slate-500">
              <div className="flex items-center gap-2"><Palette size={16} /><span className="text-sm font-bold uppercase tracking-widest">全局色彩</span></div>
              <div className="flex items-center gap-2">
                <input type="text" value={globalColor} onChange={(e) => setGlobalColor(e.target.value)} className="w-20 px-2 py-1.5 text-[12px] font-mono bg-white border border-slate-300 rounded uppercase text-center" />
                <input type="color" value={globalColor} onChange={(e) => setGlobalColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer shadow-sm" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_THEMES.map(t => <button key={t.id} onClick={() => setGlobalColor(t.hex)} title={t.name} className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${globalColor === t.hex ? 'border-slate-800 scale-110 shadow-lg' : 'border-white'}`} style={{ backgroundColor: t.hex }} />)}
            </div>
          </div>
        </div>

        {/* 步驟列表 */}
        <div className="space-y-6 pb-32">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">步驟明細列表</h2>
            <button onClick={addStep} className="flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"><Plus size={14} /> 新增步驟</button>
          </div>

          {steps.map((step, index) => {
            const currentColor = step.useCustomColor ? step.customColor : globalColor;
            return (
              <div key={step.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-md space-y-5 transition-all hover:shadow-indigo-50" style={{ borderLeft: `6px solid ${currentColor}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-black px-3 py-1 rounded-lg bg-slate-100 text-slate-500">STEP #{index + 1}</span>
                  <div className="flex gap-3">
                    <button onClick={() => toggleActive(step.id)} className={`flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${step.active ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><CheckCircle2 size={12} /> {step.active ? '實心風格' : '外框風格'}</button>
                    <button onClick={() => removeStep(step.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex bg-slate-50 p-1.5 rounded-xl gap-1.5 border border-slate-100 shadow-inner">
                      {['left', 'center', 'right'].map(align => (
                        <button key={align} onClick={() => updateStep(step.id, 'textAlign', align)} className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${step.textAlign === align ? 'bg-white shadow-md text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>
                          {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                        </button>
                      ))}
                    </div>
                    {!unifyWidth && <div className="flex items-center bg-slate-50 px-3 rounded-xl border border-slate-100 shadow-inner"><input type="number" value={step.width} onChange={(e) => updateStep(step.id, 'width', Number(e.target.value))} className="w-full bg-transparent text-[13px] font-bold text-center outline-none" /><span className="text-[11px] text-slate-400 ml-1">px</span></div>}
                  </div>

                  {/* 換行功能開關 - 僅在橫向佈局顯示 */}
                  {orientation === 'horizontal' && (
                    <div className="space-y-3">
                      <button 
                        onClick={() => updateStep(step.id, 'breakAfter', !step.breakAfter)}
                        className={`w-full py-2.5 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${step.breakAfter ? 'bg-orange-500 border-orange-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-orange-300 hover:text-orange-600'}`}
                      >
                        <CornerDownRight size={16} />
                        {step.breakAfter ? '已設定此步後分行' : '設定在此步後分行'}
                      </button>
                      
                      {/* 分行後的接續符號開關 */}
                      {step.breakAfter && (
                        <label className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200 cursor-pointer group shadow-sm">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={step.showConnector} 
                              onChange={(e) => updateStep(step.id, 'showConnector', e.target.checked)} 
                              className="rounded focus:ring-0 w-4 h-4 text-orange-600" 
                            />
                            <span className="text-[13px] font-bold text-orange-700 uppercase group-hover:underline">顯示換行接續符號 ( {'>'} )</span>
                          </div>
                          <Link size={14} className="text-orange-300" />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">流程框簡稱</label>
                      <input type="text" placeholder="輸入標題..." value={step.shortTitle} onChange={(e) => updateStep(step.id, 'shortTitle', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[14px] font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">自訂標籤 (選填)</label>
                      <input type="text" placeholder="例如：由秘書執行" value={step.customStepLabel} onChange={(e) => updateStep(step.id, 'customStepLabel', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[14px] focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                    </div>
                    {showDetails && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">詳細卡片大標題</label>
                        <input type="text" placeholder="卡片詳細標題" value={step.fullTitle} onChange={(e) => updateStep(step.id, 'fullTitle', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[14px] focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500">圖示設定</span>
                      <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:text-indigo-700 hover:underline flex items-center gap-1">
                        <Search size={10} /> 尋找圖示
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                       <input 
                        type="text" 
                        placeholder="手動輸入 Lucide 名稱" 
                        value={step.icon} 
                        onChange={(e) => updateStep(step.id, 'icon', e.target.value)} 
                        className="w-full p-2.5 bg-slate-50 rounded-xl text-[14px] font-mono outline-none border border-slate-100 focus:border-indigo-300 focus:bg-white transition-all" 
                       />
                       <div className="p-2.5 bg-indigo-50 rounded-xl shadow-inner border border-indigo-100">
                        <SafeIcon name={step.icon} size={20} className="text-indigo-500" />
                       </div>
                    </div>

                    {/* 圖示搜尋框 */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner group-within:border-indigo-200 transition-all">
                      <Search size={14} className="text-slate-400" />
                      <input 
                        type="text"
                        placeholder="搜尋圖示庫..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="bg-transparent text-[12px] outline-none w-full font-medium"
                      />
                      {iconSearch && (
                        <button onClick={() => setIconSearch('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto pr-1">
                      {filteredIcons.map(name => (
                        <button key={name} title={name} onClick={() => updateStep(step.id, 'icon', name)} className={`p-2 rounded-lg transition-all flex justify-center items-center ${step.icon === name ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                          <SafeIcon name={name} size={16} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 shadow-sm">
                    <input type="checkbox" checked={step.useCustomColor} onChange={(e) => updateStep(step.id, 'useCustomColor', e.target.checked)} className="rounded focus:ring-0 w-4 h-4 text-indigo-600" />
                    <span className="text-[13px] font-bold text-indigo-600">使用獨立色彩</span>
                    {step.useCustomColor && <input type="color" value={step.customColor} onChange={(e) => updateStep(step.id, 'customColor', e.target.value)} className="ml-auto w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm" />}
                  </div>
                  
                  {showDetails && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">詳細描述內容</label>
                      <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[14px] text-slate-600 outline-none min-h-[100px] focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-inner" value={step.description} onChange={(e) => updateStep(step.id, 'description', e.target.value)} placeholder="輸入描述內容..." />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 預覽畫布 (右側區塊) */}
      <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-start overflow-auto bg-[#f8fafc] h-screen shadow-inner">
        <div 
          ref={previewRef} 
          className={`py-12 px-12 flex ${orientation === 'vertical' ? 'flex-row items-center' : 'flex-col items-center'} gap-16 justify-center mx-auto transition-all w-fit bg-[#f8fafc]`}
          style={{ minWidth: orientation === 'vertical' ? '1200px' : 'auto' }}
        >
          {/* 流程路線 (左側/上方) */}
          <div className={`relative p-14 border-2 border-dashed rounded-[60px] bg-white shadow-xl flex flex-col items-center flex-shrink-0 ${orientation === 'vertical' ? 'min-h-[700px] justify-center' : 'w-full max-w-6xl'}`} 
            style={{ borderColor: `${globalColor}40` }}
          >
            <div className={`flex flex-wrap ${orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center'} justify-center gap-x-10 gap-y-14 relative z-10 w-full`}>
              {steps.map((step, index) => {
                const currentColor = step.useCustomColor ? step.customColor : globalColor;
                const pillWidth = unifyWidth ? globalStepWidth : step.width;
                const isCentered = (step.textAlign || 'center') === 'center';
                
                const showRowConnector = index > 0 && orientation === 'horizontal' && steps[index-1].breakAfter && steps[index-1].showConnector;

                return (
                  <React.Fragment key={step.id}>
                    {showRowConnector && (
                      <div className="flex items-center justify-center p-2 opacity-40 shrink-0" style={{ color: globalColor }}>
                        <ChevronRight size={32} strokeWidth={3} />
                      </div>
                    )}

                    <div 
                      className={`px-7 py-5 rounded-[28px] transition-all duration-500 shadow-xl flex items-center gap-4 ${step.active ? 'scale-110 z-10' : 'bg-white border text-slate-600'}`} 
                      style={{ 
                        width: `${pillWidth}px`, 
                        backgroundColor: step.active ? currentColor : 'white', 
                        color: step.active ? 'white' : '#475569', 
                        borderTopColor: step.active ? currentColor : `${currentColor}25`,
                        borderRightColor: step.active ? currentColor : `${currentColor}25`,
                        borderBottomColor: step.active ? currentColor : `${currentColor}25`,
                        borderLeftColor: step.active ? currentColor : `${currentColor}25`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxShadow: step.active ? `0 25px 40px -10px ${currentColor}50` : '0 10px 20px -5px rgba(0,0,0,0.03)',
                        fontSize: `${typography.node.size}px`,
                        fontWeight: typography.node.bold ? 'bold' : 'normal',
                        fontStyle: typography.node.italic ? 'italic' : 'normal'
                      }}
                    >
                      <div className={`flex items-center gap-4 w-full ${isCentered ? 'justify-center' : step.textAlign === 'right' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                        <div className={`p-2 rounded-xl flex-shrink-0 ${step.active ? 'bg-white/25' : 'bg-slate-50 text-slate-400'}`}>
                          <SafeIcon name={step.icon} size={20} className={step.active ? 'text-white' : ''} />
                        </div>
                        <span className="overflow-hidden truncate">{step.shortTitle}</span>
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      orientation === 'horizontal' 
                        ? ( !step.breakAfter ? <ChevronRight className="w-8 h-8 shrink-0 opacity-40" style={{ color: globalColor }} strokeWidth={3} /> : null )
                        : <ChevronDown className="w-8 h-8 self-center opacity-40" style={{ color: globalColor }} strokeWidth={3} />
                    )}

                    {orientation === 'horizontal' && step.breakAfter && index < steps.length - 1 && (
                      <div className="basis-full h-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <div 
              className="mt-12 text-center relative z-10 tracking-widest"
              style={{
                fontSize: `${footerNote.size}px`,
                color: footerNote.color,
                fontWeight: footerNote.bold ? 'bold' : 'normal',
                fontStyle: footerNote.italic ? 'italic' : 'normal'
              }}
            >
              {footerNote.text}
            </div>
          </div>

          {/* 卡片區 (右側或下方) */}
          {showDetails && (
            <div className={`grid gap-10 ${orientation === 'horizontal' ? 'grid-cols-1 md:grid-cols-3 w-full max-w-6xl' : 'grid-cols-1 w-[450px] content-start'}`}>
              {steps.map((step, index) => {
                const currentColor = step.useCustomColor ? step.customColor : globalColor;
                const displayLabel = step.customStepLabel || `步驟 ${index + 1 < 10 ? '0' + (index + 1) : index + 1}`;
                
                return (
                  <div 
                    key={step.id} 
                    className={`p-10 rounded-[45px] bg-white shadow-2xl transition-all duration-700 group hover:shadow-indigo-100 hover:-translate-y-2 relative overflow-hidden`} 
                    style={{ 
                      borderLeftWidth: '12px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: currentColor,
                      borderTopWidth: '2px',
                      borderTopStyle: 'solid',
                      borderTopColor: !step.active ? `${currentColor}15` : `${currentColor}30`,
                      borderRightWidth: '2px',
                      borderRightStyle: 'solid',
                      borderRightColor: !step.active ? `${currentColor}15` : `${currentColor}30`,
                      borderBottomWidth: '2px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: !step.active ? `${currentColor}15` : `${currentColor}30`
                    }}
                  >
                    <div className="absolute -right-8 -bottom-8 opacity-[0.15] transition-transform duration-1000 group-hover:scale-125 group-hover:-rotate-12" style={{ color: currentColor }}>
                      <SafeIcon name={step.icon} size={150} />
                    </div>
                    <div className="flex flex-col gap-1 mb-6 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[22px] shadow-xl transition-all duration-500" style={{ backgroundColor: step.active ? currentColor : `${currentColor}10`, color: step.active ? 'white' : currentColor }}>
                          <SafeIcon name={step.icon} size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span 
                            className="uppercase tracking-[0.3em] mb-1 opacity-60" 
                            style={{ 
                              color: currentColor, fontSize: `${typography.label.size}px`,
                              fontWeight: typography.label.bold ? '900' : 'normal',
                              fontStyle: typography.label.italic ? 'italic' : 'normal'
                            }}
                          >
                            {displayLabel}
                          </span>
                          <h3 
                            className="tracking-tight transition-colors leading-tight" 
                            style={{ 
                              color: '#1e293b', fontSize: `${typography.title.size}px`,
                              fontWeight: typography.title.bold ? '800' : 'normal',
                              fontStyle: typography.title.italic ? 'italic' : 'normal'
                            }}
                          >
                            {step.fullTitle}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <p 
                      className="text-slate-500 leading-relaxed relative z-10 font-medium whitespace-pre-wrap pr-4"
                      style={{ 
                        fontSize: `${typography.desc.size}px`,
                        fontWeight: typography.desc.bold ? 'bold' : 'normal',
                        fontStyle: typography.desc.italic ? 'italic' : 'normal'
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 下載按鈕 */}
        <div className="fixed bottom-8 right-8 z-50 print:hidden">
          <button 
            onClick={exportAsPng} 
            disabled={isExporting} 
            className="flex items-center gap-3 px-10 py-5 text-white rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 font-black text-lg" 
            style={{ backgroundColor: globalColor, boxShadow: `0 20px 40px -10px ${globalColor}60` }}
          >
            {isExporting ? <Loader2 className="animate-spin" size={24} /> : <ImageIconLucide size={24} />} 
            產出 PNG 圖檔
          </button>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media print { .print\\:hidden { display: none !important; } .flex-1 { padding: 0 !important; overflow: visible !important; } body { background-color: white !important; } }
        input[type='number']::-webkit-inner-spin-button, input[type='number']::-webkit-outer-spin-button { opacity: 1; height: 30px; }
      `}</style>
    </div>
  );
}
