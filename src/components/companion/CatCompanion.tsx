import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  BookOpen,
  Volume2,
  ExternalLink,
  RotateCcw,
  Search,
  Globe,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'cat';
  text: string;
  timestamp: string;
  groundingSources?: {
    type: 'pdf_curriculum' | 'gemini_explanation' | 'internet_search';
    title: string;
    pageNumber?: number;
    url?: string;
    snippet?: string;
  }[];
  modelUsed?: string;
}

interface CatCompanionProps {
  currentSentence: SentenceItem | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const CatCompanion: React.FC<CatCompanionProps> = ({
  currentSentence,
  isOpen,
  onToggle
}) => {
  const { progress } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'cat',
      text: 'أهلاً بك يا بطل في **مهارة (MAHARAH)**! أنا قطّك التعليمي الرمادي "فرهود" 🐱. أنا هنا لمساعدتك في فهم كل جملة إنجليزية، وشرح قواعد منهج الصف الحادي عشر (حضرموت)، أو ممارسة محادثات الحياة اليومية.',
      timestamp: 'الآن'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [enableInternetSearch, setEnableInternetSearch] = useState(false);
  const [catMood, setCatMood] = useState<'idle' | 'thinking' | 'speaking' | 'celebrating'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);
    setCatMood('thinking');

    try {
      const payload = {
        message: text,
        level: progress.level,
        activeTrack: progress.activeTrack,
        currentSentence: currentSentence
          ? {
              english: currentSentence.english,
              arabic: currentSentence.arabic,
              topicTitleAr: currentSentence.topicNameAr,
              grammarPoint: currentSentence.grammarPoint,
              vocabulary: currentSentence.vocabulary
            }
          : undefined,
        enableInternetSearch
      };

      const res = await fetch('/api/gemini/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setCatMood('speaking');

      const catMsg: ChatMessage = {
        id: `cat_${Date.now()}`,
        sender: 'cat',
        text: data.reply || 'عفواً، لم أستطع الإجابة حالياً.',
        timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, catMsg]);
    } catch (err: any) {
      console.error('Companion request error:', err);
      setCatMood('idle');
      setMessages(prev => [
        ...prev,
        {
          id: `cat_${Date.now()}`,
          sender: 'cat',
          text: 'واجهت عائقاً بسيطاً في الاتصال بالخادم. تأكد من اتصال الإنترنت أو راجع مفتاح جيميناي في لوحة الإعدادات.',
          timestamp: 'الآن'
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setCatMood('idle'), 4000);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'cat',
        text: 'بدأنا محادثة جديدة! ما الذي تحب أن نتعلمه أو نراجعه الآن؟',
        timestamp: 'الآن'
      }
    ]);
  };

  const quickPrompts = [
    { label: '🔍 اشرح الجملة الحالية', prompt: `اشرح لي هذه الجملة وقواعدها بالتفصيل: "${currentSentence?.english || ''}"` },
    { label: '📘 ابحث في كتيّب المنهج', prompt: `ابحث لي في كتيّب مقرر الصف الحادي عشر بحضرموت عن قاعدة: ${currentSentence?.topicNameAr || 'القواعد'}` },
    { label: '💡 أمثلة إضافية مترجمة', prompt: `أعطني 3 أمثلة إضافية على نفس السياق مع الترجمة العربية الكاملة لكل جملة.` },
    { label: '🎯 اختبرني بسؤال سريع', prompt: `أعطني سؤالاً سريعاً على الجملة الحالية لأختبر فهمي.` }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        aria-label="افتح رفيق مهارة الذكي"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-xl hover:bg-stone-800 transition-transform active:scale-95 group border border-stone-700"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-amber-100 ring-2 ring-amber-400 shrink-0">
          <img
            src="/src/assets/images/cat_companion_fullbody_1794437148306.jpg"
            alt="فرهود الرفيق الذكي"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold tracking-wide text-amber-200">الرفيق الذكي جيميناي</p>
          <p className="text-sm font-bold text-stone-100">اسأل فرهود 🐱</p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl bg-white border border-stone-200 rounded-3xl overflow-hidden flex flex-col ${
        isMinimized
          ? 'bottom-6 left-6 w-80 h-16'
          : 'bottom-4 left-4 right-4 md:right-auto md:left-6 md:w-[680px] lg:w-[760px] h-[640px] max-h-[90vh]'
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-stone-100/90 backdrop-blur-sm border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white ring-2 ring-amber-300 shadow-sm shrink-0">
            <img
              src="/src/assets/images/cat_companion_fullbody_1794437148306.jpg"
              alt="فرهود الرفيق الذكي"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-sm">فرهود — رفيق مهارة الذكي</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {catMood === 'thinking' ? 'فرهود يفكر في الإجابة...' : catMood === 'speaking' ? 'فرهود يشرح لك الآن' : 'جاهز لمساعدتك في أي سؤال لغوي أو منهجي'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setEnableInternetSearch(prev => !prev)}
            title={enableInternetSearch ? 'البحث بالإنترنت مفعل' : 'تفعيل البحث بالإنترنت'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
              enableInternetSearch ? 'bg-sky-100 text-sky-800 font-medium' : 'text-stone-500 hover:bg-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بحث الويب</span>
          </button>

          <button
            onClick={handleClearHistory}
            title="محادثة جديدة"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMinimized(prev => !prev)}
            title={isMinimized ? 'تكبير' : 'تصغير'}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggle}
            title="إغلاق النافذة"
            className="p-2 text-stone-500 hover:text-red-600 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-stone-50/50">
          {/* Side: Full-Body 2D Cat Companion Stage */}
          <div className="w-full md:w-56 bg-stone-100/70 p-4 border-b md:border-b-0 md:border-l border-stone-200 flex flex-col items-center justify-between shrink-0">
            <div className="w-full text-center">
              <span className="inline-block text-[11px] font-semibold text-stone-600 bg-white border border-stone-200/80 px-2.5 py-1 rounded-full mb-2 shadow-2xs">
                {currentSentence ? 'سياق الجلسة مفعّل' : 'سياق عام'}
              </span>

              {currentSentence && (
                <div className="bg-white p-2.5 rounded-2xl border border-stone-200 text-right shadow-2xs text-xs mb-2">
                  <p className="font-semibold text-stone-800 line-clamp-1">{currentSentence.topicNameAr}</p>
                  <p className="text-[11px] text-stone-500 font-latin truncate" dir="ltr">
                    "{currentSentence.english}"
                  </p>
                </div>
              )}
            </div>

            {/* Complete Full-Body 2D Cat Illustration Display */}
            <div className="relative my-2 w-36 h-48 md:w-44 md:h-64 flex items-center justify-center">
              <img
                src="/src/assets/images/cat_companion_fullbody_1794437148306.jpg"
                alt="فرهود القط الرمادي الذكي بكامل جسمه"
                className={`w-full h-full object-contain drop-shadow-md transition-transform duration-300 ${
                  catMood === 'thinking' ? 'scale-95 animate-pulse' : catMood === 'speaking' ? 'scale-105' : 'hover:scale-102'
                }`}
              />

              {/* Dynamic Speech Indicator Badge */}
              {catMood === 'thinking' && (
                <div className="absolute -top-1 right-2 bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                  يفكر...
                </div>
              )}
            </div>

            <div className="text-center w-full">
              <p className="text-xs font-bold text-stone-800">فرهود (Farhood)</p>
              <p className="text-[11px] text-stone-500">معلمك الخاص بالذكاء الاصطناعي</p>
            </div>
          </div>

          {/* Main Chat & Knowledge Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-br-xs shadow-sm text-right'
                        : 'bg-stone-100 text-stone-900 rounded-bl-xs border border-stone-200/80 shadow-2xs text-right'
                    }`}
                  >
                    {/* Message Body with clean formatting */}
                    <div className="whitespace-pre-wrap font-sans text-[13px] md:text-sm">
                      {msg.text}
                    </div>

                    {/* Sources grounding chips if provided */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-1.5 text-xs">
                        <p className="font-semibold text-stone-600 text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-600" />
                          المصادر المعتمدة المرجعية:
                        </p>
                        {msg.groundingSources.map((src, i) => (
                          <div
                            key={i}
                            className="bg-white/80 p-2 rounded-xl border border-stone-200 text-stone-700 flex items-start justify-between gap-2"
                          >
                            <div className="text-right">
                              <span className="font-semibold text-stone-900 block text-[11px]">{src.title}</span>
                              {src.snippet && (
                                <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">{src.snippet}</p>
                              )}
                            </div>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-600 hover:text-sky-800 p-1 shrink-0"
                                title="فتح المصدر الخارجي"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'cat' && (
                        <button
                          onClick={() => playEnglishAudio(msg.text.replace(/[\u0600-\u06FF]/g, ''))}
                          className="hover:text-stone-700 flex items-center gap-0.5"
                          title="قراءة النص الإنجليزي صوتياً"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>استمع</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 text-stone-500 text-xs bg-stone-100 rounded-2xl w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>فرهود يستخرج الإجابة من كتيّب المنهج والذكاء الاصطناعي...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Context Prompts Chips */}
            {currentSentence && (
              <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="text-[11px] whitespace-nowrap bg-white hover:bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="اسأل فرهود أي سؤال عن الجملة أو القواعد أو كتيّب المنهج..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-100 focus:bg-white text-stone-900 text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-amber-600 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
