import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ExerciseItem,
  EXERCISES_COLLECTION,
  MatchPairsExercise,
  LetterSpellingExercise,
  SentenceReorderExercise,
  FillBlankExercise,
  ReadingComprehensionExercise
} from '../../data/exerciseData.ts';
import { playEnglishAudio, startListeningForSpeech } from '../../services/audioService.ts';
import { addMistakeToReviewDeck } from '../../services/storageService.ts';
import { useSession } from '../../context/SessionContext.tsx';

interface ExerciseEngineProps {
  onOpenCompanion: () => void;
}

export const ExerciseEngine: React.FC<ExerciseEngineProps> = ({ onOpenCompanion }) => {
  const { progress, recordExerciseResult } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // States for matching pairs
  const [selectedPairEnglish, setSelectedPairEnglish] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);

  // States for letter spelling
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);

  // States for sentence reordering
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);

  // States for audio / speech
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecordedText, setSpeechRecordedText] = useState('');

  const currentExercise = EXERCISES_COLLECTION[currentIndex] || EXERCISES_COLLECTION[0];

  const resetCurrentState = () => {
    setSelectedOptionId(null);
    setTextInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setSelectedPairEnglish(null);
    setMatchedPairIds([]);
    setSelectedLetters([]);
    setArrangedWords([]);
    setIsRecording(false);
    setSpeechRecordedText('');
  };

  const handleNextExercise = () => {
    resetCurrentState();
    if (currentIndex < EXERCISES_COLLECTION.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevExercise = () => {
    resetCurrentState();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Answer checking logic
  const checkAnswer = () => {
    if (isAnswerChecked) return;

    let correct = false;

    switch (currentExercise.type) {
      case 'multiple_choice':
      case 'grammar_context':
      case 'situation_choice': {
        correct = selectedOptionId === (currentExercise as any).correctOptionId;
        break;
      }
      case 'match_pairs': {
        const mp = currentExercise as MatchPairsExercise;
        correct = matchedPairIds.length === mp.pairs.length;
        break;
      }
      case 'letter_spelling': {
        const sp = currentExercise as LetterSpellingExercise;
        correct = selectedLetters.join('') === sp.targetWord.toUpperCase();
        break;
      }
      case 'sentence_reorder': {
        const sr = currentExercise as SentenceReorderExercise;
        correct = arrangedWords.join(' ') === sr.correctOrder.join(' ');
        break;
      }
      case 'fill_blank': {
        const fb = currentExercise as FillBlankExercise;
        correct = selectedOptionId === fb.correctAnswer;
        break;
      }
      case 'translate_en_to_ar':
      case 'translate_ar_to_en':
      case 'dialogue_complete':
      case 'reading_comprehension':
      case 'listening_comprehension': {
        correct = selectedOptionId === (currentExercise as any).correctAnswer;
        break;
      }
      case 'listen_choose': {
        correct = selectedOptionId === (currentExercise as any).correctOptionId;
        break;
      }
      case 'dictation': {
        const cleanInput = textInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanTarget = currentExercise.englishSentence.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        correct = cleanInput === cleanTarget;
        break;
      }
      case 'pronunciation_practice': {
        correct = speechRecordedText.length > 0;
        break;
      }
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);
    recordExerciseResult(correct);

    if (!correct) {
      // Add mistake to personalized review deck
      addMistakeToReviewDeck(
        currentExercise.id,
        currentExercise.englishSentence,
        currentExercise.arabicTranslation,
        currentExercise.topicTitleAr,
        currentExercise.explanationAr
      );
    }
  };

  // Render Sub-type interfaces
  const renderExerciseBody = () => {
    switch (currentExercise.type) {
      case 'multiple_choice':
      case 'grammar_context':
      case 'situation_choice': {
        const ex = currentExercise as any;
        return (
          <div className="space-y-3 mt-4">
            {ex.promptQuestionAr && (
              <p className="text-sm font-bold text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {ex.promptQuestionAr}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ex.options.map((opt: any) => {
                const isSelected = selectedOptionId === opt.id;
                let btnStyle = 'border-stone-200 hover:border-stone-300 bg-white';
                if (isAnswerChecked) {
                  if (opt.id === ex.correctOptionId) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-red-500 bg-red-50 text-red-900';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold ring-1 ring-amber-500';
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <div>
                      <span className="block font-latin font-bold text-sm" dir="ltr">{opt.text}</span>
                      {opt.textAr && <span className="text-xs text-stone-500 mt-0.5 block">{opt.textAr}</span>}
                    </div>
                    {isAnswerChecked && opt.id === ex.correctOptionId && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'match_pairs': {
        const mp = currentExercise as MatchPairsExercise;
        return (
          <div className="mt-4">
            <p className="text-xs text-stone-500 mb-3">
              انقر على الكلمة الإنجليزية أولاً ثم اختر معناها العربي المطابق:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* English column */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 block text-center">المفردات بالإنجليزية</span>
                {mp.pairs.map(p => {
                  const isMatched = matchedPairIds.includes(p.id);
                  const isSelected = selectedPairEnglish === p.id;
                  return (
                    <button
                      key={p.id}
                      disabled={isMatched || isAnswerChecked}
                      onClick={() => setSelectedPairEnglish(p.id)}
                      className={`w-full p-3 rounded-xl border text-center font-latin font-bold text-xs transition-all ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-70'
                          : isSelected
                          ? 'bg-amber-100 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                      }`}
                      dir="ltr"
                    >
                      {p.english}
                    </button>
                  );
                })}
              </div>

              {/* Arabic column */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 block text-center">المعاني بالعربية</span>
                {mp.pairs.map(p => {
                  const isMatched = matchedPairIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      disabled={isMatched || isAnswerChecked || !selectedPairEnglish}
                      onClick={() => {
                        if (selectedPairEnglish === p.id) {
                          setMatchedPairIds(prev => [...prev, p.id]);
                          setSelectedPairEnglish(null);
                        } else {
                          // Wrong match
                          setSelectedPairEnglish(null);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 line-through opacity-70'
                          : 'bg-white border-stone-200 hover:bg-amber-50 text-stone-800'
                      }`}
                    >
                      {p.arabic}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'letter_spelling': {
        const sp = currentExercise as LetterSpellingExercise;
        return (
          <div className="mt-4 text-center">
            <span className="text-xs text-stone-500 block mb-2">المعنى المطلوب: {sp.wordMeaningAr}</span>

            {/* Selected Letters Display */}
            <div className="flex items-center justify-center gap-1.5 min-h-[52px] p-2 bg-stone-100 rounded-2xl mb-4 border border-stone-200">
              {selectedLetters.length === 0 ? (
                <span className="text-xs text-stone-400">انقر على الحروف بالأسفل بالترتيب</span>
              ) : (
                selectedLetters.map((l, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setSelectedLetters(prev => prev.filter((_, idx) => idx !== i));
                      }
                    }}
                    className="w-9 h-9 bg-white border border-stone-300 text-stone-900 font-bold rounded-xl flex items-center justify-center cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    {l}
                  </span>
                ))
              )}
            </div>

            {/* Letter bank */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {sp.scrambledLetters.map((l, i) => (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedLetters(prev => [...prev, l])}
                  className="w-10 h-10 bg-white hover:bg-stone-50 active:scale-95 text-stone-900 font-extrabold text-sm rounded-xl border border-stone-300 shadow-2xs transition-all"
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedLetters([])}
              disabled={isAnswerChecked}
              className="mt-3 text-xs text-stone-400 hover:text-stone-700 underline"
            >
              مسح الحروف والبدء من جديد
            </button>
          </div>
        );
      }

      case 'sentence_reorder': {
        const sr = currentExercise as SentenceReorderExercise;
        return (
          <div className="mt-4">
            <p className="text-xs text-stone-500 mb-2">
              انقر على الكلمات لتكوين جملة بالترتيب النحوي الصحيح:
            </p>

            {/* Constructed Sentence Box */}
            <div className="min-h-[56px] p-3 bg-stone-100 rounded-2xl border border-stone-200 flex flex-wrap gap-2 items-center mb-4" dir="ltr">
              {arrangedWords.length === 0 ? (
                <span className="text-xs text-stone-400">الجملة المجمّعة ستظهر هنا...</span>
              ) : (
                arrangedWords.map((w, idx) => (
                  <span
                    key={idx}
                    onClick={() => {
                      if (!isAnswerChecked) {
                        setArrangedWords(prev => prev.filter((_, i) => i !== idx));
                      }
                    }}
                    className="bg-white px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 font-bold text-xs shadow-2xs cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    {w}
                  </span>
                ))
              )}
            </div>

            {/* Word Tiles Pool */}
            <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
              {sr.words.map((w, i) => {
                const usedCount = arrangedWords.filter(aw => aw === w).length;
                const totalInWords = sr.words.filter(sw => sw === w).length;
                const isAllUsed = usedCount >= totalInWords;

                return (
                  <button
                    key={i}
                    disabled={isAllUsed || isAnswerChecked}
                    onClick={() => setArrangedWords(prev => [...prev, w])}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isAllUsed
                        ? 'bg-stone-200 text-stone-400 opacity-50'
                        : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 shadow-2xs active:scale-95'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'listen_choose':
      case 'listening_comprehension': {
        const ex = currentExercise as any;
        return (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-xs text-stone-500 block mb-2">استمع للتسجيل الصوتي بدقة:</span>
              <button
                onClick={() => playEnglishAudio(ex.audioPrompt)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 mx-auto transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل الصوت</span>
              </button>
            </div>

            {ex.comprehensionQuestionAr && (
              <p className="text-sm font-bold text-stone-800">{ex.comprehensionQuestionAr}</p>
            )}

            <div className="space-y-2">
              {ex.options?.map((opt: any) => {
                const optId = typeof opt === 'string' ? opt : opt.id || opt.text;
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isSelected = selectedOptionId === optId;
                return (
                  <button
                    key={optId}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(optId)}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-latin">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'dictation': {
        return (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-xs text-stone-500 block mb-2">استمع للجملة واكتبها بالإنجليزية:</span>
              <button
                onClick={() => playEnglishAudio(currentExercise.englishSentence)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 mx-auto transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>استمع للجملة</span>
              </button>
            </div>

            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="اكتب الجملة بالإنجليزية هنا..."
              dir="ltr"
              disabled={isAnswerChecked}
              className="w-full p-3.5 rounded-2xl border border-stone-300 font-latin text-sm text-stone-900 focus:outline-none focus:border-amber-600"
              rows={2}
            />
          </div>
        );
      }

      case 'reading_comprehension': {
        const rc = currentExercise as ReadingComprehensionExercise;
        return (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-right space-y-2">
              <span className="text-xs font-bold text-amber-800 block">نص القراءة من المقرر:</span>
              <p className="text-sm font-latin text-stone-900 leading-relaxed" dir="ltr">
                {rc.readingPassageEn}
              </p>
              <p className="text-xs text-stone-500 pt-2 border-t border-stone-200/80">
                الترجمة: {rc.readingPassageAr}
              </p>
            </div>

            <p className="text-sm font-bold text-stone-800">{rc.questionAr}</p>

            <div className="space-y-2">
              {rc.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOptionId(opt)}
                  className={`w-full p-3.5 rounded-2xl border text-right text-xs sm:text-sm font-latin transition-all ${
                    selectedOptionId === opt
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                  }`}
                  dir="ltr"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      default: {
        // Generic options for translation, fill blank, etc.
        const ex = currentExercise as any;
        const optionsList = ex.options || [];
        return (
          <div className="space-y-3 mt-4">
            {ex.speakerA && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-latin" dir="ltr">
                <p className="font-bold text-stone-800">{ex.speakerA}</p>
                <p className="text-stone-500 mt-1">{ex.speakerBBlank}</p>
              </div>
            )}

            <div className="space-y-2">
              {optionsList.map((opt: any, i: number) => {
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isSelected = selectedOptionId === optText;
                return (
                  <button
                    key={i}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(optText)}
                    className={`w-full p-3.5 rounded-2xl border text-right text-xs sm:text-sm transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <span>{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6" dir="rtl">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-right">
        {/* Top Exercise Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              تمرين {currentIndex + 1} من {EXERCISES_COLLECTION.length}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {currentExercise.topicTitleAr}
            </span>
          </div>

          <button
            onClick={onOpenCompanion}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>طلب مساعدة فرهود</span>
          </button>
        </div>

        {/* Instruction */}
        <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
          {currentExercise.instructionAr}
        </h3>

        {/* Exercise Body */}
        {renderExerciseBody()}

        {/* Feedback & Explanations (Appears after checking) */}
        {isAnswerChecked && (
          <div
            className={`mt-6 p-4 rounded-2xl border animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>إجابة صحيحة ومتميزة! أحسنت يا بطل.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>إجابة غير دقيقة. تم حفظها في "المراجعة المخصصة" لإتقانها.</span>
                </>
              )}
            </div>

            <div className="text-xs space-y-1.5 pt-2 border-t border-current/20">
              <p>
                <strong>الجملة الإنجليزية الكاملة:</strong> "{currentExercise.englishSentence}"
              </p>
              <p>
                <strong>الترجمة العربية:</strong> "{currentExercise.arabicTranslation}"
              </p>
              <p className="opacity-90">
                <strong>توضيح القاعدة:</strong> {currentExercise.explanationAr}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={handlePrevExercise}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            <span>التمرين السابق</span>
          </button>

          {!isAnswerChecked ? (
            <button
              onClick={checkAnswer}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              تحقق من الإجابة
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <span>التمرين التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
