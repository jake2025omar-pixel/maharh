import React, { useEffect, useState } from 'react';
import { X, Volume2, BookOpen, AlertTriangle, Loader2, Layers } from 'lucide-react';
import { playEnglishAudio } from '../../services/audioService.ts';
import {
  fetchDeepVocabularyProfile,
  DeepVocabularyProfile,
  CEFRLevel
} from '../../services/pedagogyClient.ts';

interface LexicalDeepModalProps {
  word: string | null;
  initialMeaningAr?: string;
  sentenceContext?: string;
  cefrLevel: CEFRLevel;
  onClose: () => void;
}

export const LexicalDeepModal: React.FC<LexicalDeepModalProps> = ({
  word,
  initialMeaningAr,
  sentenceContext,
  cefrLevel,
  onClose
}) => {
  const [profile, setProfile] = useState<DeepVocabularyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!word) {
      setProfile(null);
      setErrorMsg(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    setProfile(null);

    fetchDeepVocabularyProfile({
      word,
      sentenceContext,
      cefrLevel
    })
      .then(data => {
        if (!cancelled) {
          setProfile(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setErrorMsg(err?.message || 'تعذر تحميل التحليل اللغوي العميق حالياً.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [word, sentenceContext, cefrLevel]);

  if (!word) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-xl p-6 sm:p-7 space-y-5 text-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-sky-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>التحليل المعجمي والصوتي العميق</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 font-latin" dir="ltr">
                {profile?.word || word}
              </h2>
              <button
                type="button"
                onClick={() => playEnglishAudio(profile?.word || word)}
                className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 transition-colors"
                title="استماع للنطق"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {profile?.partOfSpeech && (
                <span className="text-xs font-medium text-slate-500 font-latin">
                  ({profile.partOfSpeech})
                </span>
              )}
            </div>
            {(profile?.ipaUK || profile?.ipaUS) && (
              <p className="text-xs text-slate-500 font-latin" dir="ltr">
                UK {profile.ipaUK} · US {profile.ipaUS}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="surface-icy rounded-2xl p-6 flex items-center justify-center gap-3 text-xs text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span>جارٍ إعداد البطاقة المعجمية والصوتية الشاملة للكلمة...</span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">تنبيه</p>
            <p>{errorMsg}</p>
            {initialMeaningAr && (
              <p className="pt-1 text-slate-700">
                المعنى الأساسي المسجل: <strong>{initialMeaningAr}</strong>
              </p>
            )}
          </div>
        )}

        {/* Deep Profile Body */}
        {profile && (
          <div className="space-y-5">
            {/* Definitions */}
            <div className="surface-icy rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-base font-bold text-slate-900">
                  {(profile.arabicMeanings?.length ? profile.arabicMeanings.join(' · ') : '') || initialMeaningAr}
                </p>
                {profile.registerNoteAr && (
                  <span className="text-xs text-sky-800">{profile.registerNoteAr}</span>
                )}
              </div>
              {profile.englishDefinition && (
                <p className="text-xs sm:text-sm text-slate-700 font-latin leading-relaxed" dir="ltr">
                  {profile.englishDefinition}
                </p>
              )}
            </div>

            {/* Collocations & Word Family */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.collocations?.length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    <span>المتلازمات اللفظية الشائعة</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs">
                    {profile.collocations.map((col, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                        <span className="font-latin font-semibold text-slate-900" dir="ltr">
                          {col.phraseEn}
                        </span>
                        <span className="text-slate-600">{col.meaningAr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.wordFamily?.length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900">عائلة الكلمة والاشتقاقات</h3>
                  <ul className="space-y-1.5 text-xs">
                    {profile.wordFamily.map((wf, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                        <span className="font-latin font-semibold text-slate-900" dir="ltr">
                          {wf.form}{' '}
                          <span className="text-slate-400 font-normal">({wf.partOfSpeech})</span>
                        </span>
                        <span className="text-slate-600">{wf.meaningAr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Synonyms & Antonyms */}
            {(profile.synonyms?.length > 0 || profile.antonyms?.length > 0) && (
              <div className="p-4 rounded-2xl bg-[#F0F7FA]/55 border border-sky-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {profile.synonyms?.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">المرادفات (Synonyms):</span>
                    <span className="font-latin text-slate-700" dir="ltr">
                      {profile.synonyms.join(' · ')}
                    </span>
                  </div>
                )}
                {profile.antonyms?.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">الأضداد (Antonyms):</span>
                    <span className="font-latin text-slate-700" dir="ltr">
                      {profile.antonyms.join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Common Mistakes */}
            {profile.commonMistakeAr && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>أخطاء شائعة يُنصح بتجنبها</span>
                </p>
                <p className="leading-relaxed">{profile.commonMistakeAr}</p>
              </div>
            )}

            {/* Contextual Examples */}
            {profile.examples?.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900">أمثلة متنوعة في السياق</h3>
                <div className="space-y-2">
                  {profile.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-slate-200/80 bg-white flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-semibold text-slate-900 font-latin" dir="ltr">
                          {ex.english}
                        </p>
                        <p className="text-xs text-slate-600">{ex.arabic}</p>
                        {ex.contextAr && <p className="text-[11px] text-slate-400">{ex.contextAr}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => playEnglishAudio(ex.english)}
                        className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 shrink-0"
                        title="استماع للمثال"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
