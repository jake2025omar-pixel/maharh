import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Plus
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
import { SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { useSession } from '../../context/SessionContext.tsx';
import { SpeechPracticePanel } from '../speech/SpeechPracticePanel.tsx';
import { SkillDomain } from '../../services/storageService.ts';
import {
  fetchAdaptiveExercise,
  fetchMistakeDiagnosis,
  AdaptiveGeneratedExercise,
  MistakeDiagnosisResult
} from '../../services/pedagogyClient.ts';

interface MatchLineCoord {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface MatchPairsBoardProps {
  exercise: MatchPairsExercise;
  isAnswerChecked: boolean;
  matchedPairIds: string[];
  onMatchPair: (pairId: string) => void;
  onResetMatches: () => void;
}

const MatchPairsBoard: React.FC<MatchPairsBoardProps> = ({
  exercise,
  isAnswerChecked,
  matchedPairIds,
  onMatchPair,
  onResetMatches
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const leftBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [wrongFlashPair, setWrongFlashPair] = useState<{ left: string; right: string } | null>(null);
  const [lineCoords, setLineCoords] = useState<MatchLineCoord[]>([]);

  // Deterministically shuffle Arabic column so rows aren't trivially parallel
  const shuffledArabicPairs = useMemo(() => {
    const arr = [...exercise.pairs];
    if (arr.length <= 1) return arr;
    // Deterministic rotation + swap based on exercise id
    return arr.map((_, idx) => arr[(idx + 1 + (idx % 2 === 0 ? 1 : 0)) % arr.length]).filter(
      (item, idx, self) => self.findIndex(x => x.id === item.id) === idx
    ).length === arr.length
      ? [...arr].reverse().map((item, idx, rev) => (idx === 0 && rev.length > 2 ? rev[1] : idx === 1 && rev.length > 2 ? rev[0] : item))
      : [...arr].reverse();
  }, [exercise]);

  const computeLines = () => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const stageRect = stageEl.getBoundingClientRect();
    const coords: MatchLineCoord[] = [];

    for (const pairId of matchedPairIds) {
      const leftEl = leftBtnRefs.current[pairId];
      const rightEl = rightBtnRefs.current[pairId];
      if (!leftEl || !rightEl) continue;

      const lRect = leftEl.getBoundingClientRect();
      const rRect = rightEl.getBoundingClientRect();

      coords.push({
        id: pairId,
        x1: lRect.right - stageRect.left,
        y1: lRect.top + lRect.height / 2 - stageRect.top,
        x2: rRect.left - stageRect.left,
        y2: rRect.top + rRect.height / 2 - stageRect.top
      });
    }
    setLineCoords(coords);
  };

  useLayoutEffect(() => {
    computeLines();
  }, [matchedPairIds, exercise.id]);

  useEffect(() => {
    const handleResize = () => computeLines();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [matchedPairIds, exercise.id]);

  // Reset local selections when exercise changes or matches reset
  useEffect(() => {
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setWrongFlashPair(null);
  }, [exercise.id, matchedPairIds.length === 0]);

  const tryConnect = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      onMatchPair(leftId);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongFlashPair(null);
    } else {
      setWrongFlashPair({ left: leftId, right: rightId });
      setTimeout(() => {
        setWrongFlashPair(null);
        setSelectedLeftId(null);
        setSelectedRightId(null);
      }, 550);
    }
  };

  const handleSelectLeft = (pairId: string) => {
    if (matchedPairIds.includes(pairId) || isAnswerChecked) return;
    if (selectedRightId) {
      tryConnect(pairId, selectedRightId);
    } else {
      setSelectedLeftId(prev => (prev === pairId ? null : pairId));
    }
  };

  const handleSelectRight = (pairId: string) => {
    if (matchedPairIds.includes(pairId) || isAnswerChecked) return;
    if (selectedLeftId) {
      tryConnect(selectedLeftId, pairId);
    } else {
      setSelectedRightId(prev => (prev === pairId ? null : pairId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>اختر التعبير الإنجليزي ثم اختر معناه العربي لرسم خط التوصيل بينهما:</span>
        {matchedPairIds.length > 0 && !isAnswerChecked && (
          <button
            type="button"
            onClick={onResetMatches}
            className="text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة التوصيل</span>
          </button>
        )}
      </div>

      {/* Explicit LTR stage keeps English left & Arabic right for exact Bezier SVG connector lines */}
      <div
        ref={stageRef}
        dir="ltr"
        className="relative surface-icy rounded-2xl p-4 sm:p-5"
      >
        {/* SVG Connecting Lines Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          aria-hidden="true"
        >
          {lineCoords.map(line => {
            const dx = Math.abs(line.x2 - line.x1) * 0.45;
            const pathD = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;
            return (
              <g key={line.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx={line.x1} cy={line.y1} r="4" fill="#0284C7" />
                <circle cx={line.x2} cy={line.y2} r="4" fill="#0284C7" />
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-2 gap-10 sm:gap-16 relative z-20">
          {/* English Column (Left) */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-medium text-slate-500 block text-center">
              English
            </span>
            {exercise.pairs.map(p => {
              const isMatched = matchedPairIds.includes(p.id);
              const isSelected = selectedLeftId === p.id;
              const isWrong = wrongFlashPair?.left === p.id;
              return (
                <button
                  key={p.id}
                  ref={el => {
                    leftBtnRefs.current[p.id] = el;
                  }}
                  type="button"
                  disabled={isMatched || isAnswerChecked}
                  onClick={() => handleSelectLeft(p.id)}
                  className={`w-full p-3 rounded-xl border text-center font-latin font-semibold text-xs sm:text-sm transition-all ${
                    isWrong
                      ? 'bg-red-50 border-red-400 text-red-900'
                      : isMatched
                      ? 'bg-sky-50/90 border-sky-400 text-sky-950'
                      : isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-sky-300 text-slate-800'
                  }`}
                >
                  {p.english}
                </button>
              );
            })}
          </div>

          {/* Arabic Column (Right) */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-medium text-slate-500 block text-center">
              العربية
            </span>
            {shuffledArabicPairs.map(p => {
              const isMatched = matchedPairIds.includes(p.id);
              const isSelected = selectedRightId === p.id;
              const isWrong = wrongFlashPair?.right === p.id;
              return (
                <button
                  key={p.id}
                  ref={el => {
                    rightBtnRefs.current[p.id] = el;
                  }}
                  type="button"
                  disabled={isMatched || isAnswerChecked}
                  onClick={() => handleSelectRight(p.id)}
                  dir="rtl"
                  className={`w-full p-3 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                    isWrong
                      ? 'bg-red-50 border-red-400 text-red-900'
                      : isMatched
                      ? 'bg-sky-50/90 border-sky-400 text-sky-950'
                      : isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:border-sky-300 text-slate-800'
                  }`}
                >
                  {p.arabic}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-numeric text-center">
        الأزواج الموصولة: {matchedPairIds.length} / {exercise.pairs.length}
      </p>
    </div>
  );
};

export interface ExerciseCardRendererProps {
  exercise: ExerciseItem;
  onCompleted?: (isCorrect: boolean) => void;
}

export const ExerciseCardRenderer: React.FC<ExerciseCardRendererProps> = ({
  exercise,
  onCompleted
}) => {
  const { progress, currentUser, recordExerciseResult } = useSession();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);

  // Deep Mistake Diagnosis state
  const [diagnosis, setDiagnosis] = useState<MistakeDiagnosisResult | null>(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [verifyOpt, setVerifyOpt] = useState<string | null>(null);
  const [verifyChecked, setVerifyChecked] = useState(false);

  // Reset state whenever rendered exercise changes
  useEffect(() => {
    setSelectedOptionId(null);
    setTextInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setMatchedPairIds([]);
    setSelectedLetters([]);
    setArrangedWords([]);
    setDiagnosis(null);
    setDiagnosisError(null);
    setVerifyOpt(null);
    setVerifyChecked(false);
  }, [exercise.id]);

  const mapExerciseToSkillDomain = (type: ExerciseItem['type']): SkillDomain => {
    if (type === 'listen_choose' || type === 'listening_comprehension' || type === 'dictation') return 'listening';
    if (type === 'reading_comprehension') return 'reading';
    if (type === 'pronunciation_practice') return 'pronunciation';
    if (type === 'match_pairs' || type === 'letter_spelling' || type === 'situation_choice') return 'vocabulary';
    return 'grammar';
  };

  const checkAnswer = () => {
    if (isAnswerChecked) return;
    let correct = false;

    switch (exercise.type) {
      case 'multiple_choice':
      case 'grammar_context':
      case 'situation_choice':
      case 'listen_choose':
      case 'listening_comprehension': {
        correct = selectedOptionId === (exercise as any).correctOptionId;
        break;
      }
      case 'match_pairs': {
        const mp = exercise as MatchPairsExercise;
        correct = matchedPairIds.length === mp.pairs.length;
        break;
      }
      case 'letter_spelling': {
        const sp = exercise as LetterSpellingExercise;
        correct = selectedLetters.join('').toUpperCase() === sp.targetWord.toUpperCase();
        break;
      }
      case 'sentence_reorder': {
        const sr = exercise as SentenceReorderExercise;
        correct = arrangedWords.join(' ') === sr.correctOrder.join(' ');
        break;
      }
      case 'fill_blank': {
        const fb = exercise as FillBlankExercise;
        correct = selectedOptionId === fb.correctAnswer;
        break;
      }
      case 'translate_en_to_ar':
      case 'translate_ar_to_en':
      case 'dialogue_complete':
      case 'reading_comprehension': {
        correct = selectedOptionId === (exercise as any).correctAnswer;
        break;
      }
      case 'dictation': {
        const cleanInput = textInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanTarget = exercise.englishSentence.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        correct = cleanInput.length > 0 && cleanInput === cleanTarget;
        break;
      }
      case 'pronunciation_practice': {
        correct = true;
        break;
      }
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    const skillDomain = mapExerciseToSkillDomain(exercise.type);
    const errorCategoryMap: Partial<Record<ExerciseItem['type'], string>> = {
      letter_spelling: 'spelling',
      dictation: 'spelling',
      sentence_reorder: 'word_order',
      fill_blank: 'tense_agreement',
      grammar_context: 'tense_agreement',
      match_pairs: 'vocabulary_choice',
      pronunciation_practice: 'pronunciation'
    };

    recordExerciseResult(
      correct,
      correct
        ? undefined
        : {
            sentenceId: exercise.id,
            english: exercise.englishSentence,
            arabic: exercise.arabicTranslation,
            topicTitleAr: exercise.topicTitleAr,
            explanationAr: exercise.explanationAr,
            errorCategory: errorCategoryMap[exercise.type] || 'other'
          },
      skillDomain
    );

    if (currentUser?.id) {
      fetch('/api/exercises/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {})
        },
        body: JSON.stringify({
          studentId: currentUser.id,
          exerciseId: exercise.id,
          exerciseType: exercise.type,
          isCorrect: correct,
          studentAnswer:
            selectedOptionId ||
            textInput ||
            arrangedWords.join(' ') ||
            selectedLetters.join('') ||
            (correct ? 'COMPLETED' : 'INCOMPLETE'),
          targetAnswer: exercise.englishSentence,
          topicId: exercise.topicId
        })
      }).catch(() => {});
    }

    onCompleted?.(correct);
  };

  const handleAnalyzeMistake = async () => {
    setLoadingDiagnosis(true);
    setDiagnosisError(null);
    const studentAnswer =
      selectedOptionId ||
      textInput ||
      arrangedWords.join(' ') ||
      selectedLetters.join('') ||
      'No answer';
    try {
      const diag = await fetchMistakeDiagnosis({
        expectedEnglish: exercise.englishSentence,
        studentAnswer,
        arabicTranslation: exercise.arabicTranslation,
        topicTitleAr: exercise.topicTitleAr,
        cefrLevel: progress.cefrLevel
      });
      setDiagnosis(diag);
    } catch (err: any) {
      setDiagnosisError(err?.message || 'تعذر تحليل الخطأ حالياً.');
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  const renderBody = () => {
    switch (exercise.type) {
      case 'multiple_choice':
      case 'grammar_context':
      case 'situation_choice': {
        const ex = exercise as any;
        return (
          <div className="space-y-3.5">
            {ex.promptQuestionAr && (
              <p className="text-sm font-semibold text-slate-900 surface-icy p-4 rounded-2xl">
                {ex.promptQuestionAr}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ex.options.map((opt: any) => {
                const isSelected = selectedOptionId === opt.id;
                let style = 'border-slate-200 hover:border-sky-300 bg-white text-slate-800';
                if (isAnswerChecked) {
                  if (opt.id === ex.correctOptionId) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (isSelected) {
                    style = 'border-red-400 bg-red-50 text-red-900';
                  }
                } else if (isSelected) {
                  style = 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-colors flex items-center justify-between gap-3 ${style}`}
                  >
                    <div>
                      <span className="block font-latin font-semibold text-sm" dir="ltr">
                        {opt.text}
                      </span>
                      {opt.textAr && (
                        <span className="text-xs text-slate-500 mt-0.5 block">{opt.textAr}</span>
                      )}
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
        const mp = exercise as MatchPairsExercise;
        return (
          <MatchPairsBoard
            exercise={mp}
            isAnswerChecked={isAnswerChecked}
            matchedPairIds={matchedPairIds}
            onMatchPair={pairId =>
              setMatchedPairIds(prev => (prev.includes(pairId) ? prev : [...prev, pairId]))
            }
            onResetMatches={() => setMatchedPairIds([])}
          />
        );
      }

      case 'letter_spelling': {
        const sp = exercise as LetterSpellingExercise;
        return (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">
              المعنى المطلوب: <strong className="text-slate-900">{sp.wordMeaningAr}</strong>
            </p>

            <div
              dir="ltr"
              className="flex items-center justify-center gap-1.5 min-h-[54px] p-3 surface-icy rounded-2xl"
            >
              {selectedLetters.length === 0 ? (
                <span className="text-xs text-slate-400">انقر على الحروف بالترتيب</span>
              ) : (
                selectedLetters.map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedLetters(prev => prev.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 bg-white border border-slate-200 text-slate-900 font-latin font-bold rounded-xl flex items-center justify-center hover:border-red-300"
                  >
                    {l}
                  </button>
                ))
              )}
            </div>

            <div dir="ltr" className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {sp.scrambledLetters.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedLetters(prev => [...prev, l])}
                  className="w-10 h-10 bg-white hover:bg-[#F0F7FA] text-slate-900 font-latin font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                >
                  {l}
                </button>
              ))}
            </div>

            {!isAnswerChecked && selectedLetters.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedLetters([])}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                مسح الحروف
              </button>
            )}
          </div>
        );
      }

      case 'sentence_reorder': {
        const sr = exercise as SentenceReorderExercise;
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              رتّب الكلمات لتكوين جملة صحيحة المعنى ({sr.arabicTranslation}):
            </p>

            <div
              dir="ltr"
              className="min-h-[56px] p-3.5 surface-icy rounded-2xl flex flex-wrap gap-2 items-center"
            >
              {arrangedWords.length === 0 ? (
                <span className="text-xs text-slate-400">الجملة المجمّعة ستظهر هنا...</span>
              ) : (
                arrangedWords.map((w, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setArrangedWords(prev => prev.filter((_, i) => i !== idx))}
                    className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900 font-latin font-semibold text-xs hover:border-red-300"
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            <div dir="ltr" className="flex flex-wrap gap-2 justify-center">
              {sr.words.map((w, i) => {
                const usedCount = arrangedWords.filter(aw => aw === w).length;
                const totalInWords = sr.words.filter(sw => sw === w).length;
                const isAllUsed = usedCount >= totalInWords;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isAllUsed || isAnswerChecked}
                    onClick={() => setArrangedWords(prev => [...prev, w])}
                    className={`px-3 py-2 rounded-xl text-xs font-latin font-semibold border transition-colors ${
                      isAllUsed
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-sky-300 text-slate-800'
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
        const ex = exercise as any;
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-5 text-center space-y-2.5">
              <span className="text-xs text-slate-500 block">استمع للتسجيل الصوتي بدقة:</span>
              <button
                type="button"
                onClick={() => playEnglishAudio(ex.audioPrompt)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل الصوت</span>
              </button>
            </div>

            {ex.comprehensionQuestionAr && (
              <p className="text-sm font-semibold text-slate-900">{ex.comprehensionQuestionAr}</p>
            )}

            <div className="space-y-2">
              {ex.options?.map((opt: any) => {
                const optId = typeof opt === 'string' ? opt : opt.id || opt.text;
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isSelected = selectedOptionId === optId;
                return (
                  <button
                    key={optId}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(optId)}
                    className={`w-full p-3.5 rounded-2xl border text-right text-xs sm:text-sm transition-colors ${
                      isAnswerChecked && optId === ex.correctOptionId
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                        : isSelected
                        ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
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

      case 'pronunciation_practice': {
        return (
          <SpeechPracticePanel
            expectedSentence={exercise.englishSentence}
            arabicTranslation={exercise.arabicTranslation}
            lessonId={exercise.topicId}
            onResultRecorded={assessment => {
              const ok =
                assessment.matchedWordsCount >= Math.ceil(assessment.totalExpectedWords * 0.7);
              setIsCorrect(ok);
              setIsAnswerChecked(true);
              recordExerciseResult(ok);
              onCompleted?.(ok);
            }}
          />
        );
      }

      case 'dictation': {
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-5 text-center space-y-2.5">
              <span className="text-xs text-slate-500 block">استمع للجملة واكتبها بالإنجليزية:</span>
              <button
                type="button"
                onClick={() => playEnglishAudio(exercise.englishSentence, 0.88)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-colors"
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
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-sky-400 focus:outline-none font-latin text-sm text-slate-900 bg-white"
              rows={2}
            />
          </div>
        );
      }

      case 'reading_comprehension': {
        const rc = exercise as ReadingComprehensionExercise;
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-4 sm:p-5 text-right space-y-2">
              <span className="text-xs font-semibold text-sky-800 block">نص القراءة من المقرر:</span>
              <p className="text-sm font-latin text-slate-900 leading-relaxed" dir="ltr">
                {rc.readingPassageEn}
              </p>
              <p className="text-xs text-slate-600 pt-2 border-t border-sky-200/60">
                الترجمة: {rc.readingPassageAr}
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-900">{rc.questionAr}</p>

            <div className="space-y-2">
              {rc.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOptionId(opt)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-latin transition-colors ${
                    isAnswerChecked && opt === rc.correctAnswer
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                      : selectedOptionId === opt
                      ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
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

      case 'fill_blank': {
        const fb = exercise as FillBlankExercise;
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-4 space-y-1.5">
              <p className="text-sm sm:text-base font-bold font-latin text-slate-900" dir="ltr">
                {fb.sentenceWithBlank}
              </p>
              <p className="text-xs text-slate-500">{fb.blankMeaningAr}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {fb.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOptionId(opt)}
                  dir="ltr"
                  className={`p-3.5 rounded-2xl border text-center font-latin text-sm transition-colors ${
                    isAnswerChecked && opt === fb.correctAnswer
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                      : selectedOptionId === opt
                      ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                      : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      default: {
        const ex = exercise as any;
        const optionsList = ex.options || [];
        return (
          <div className="space-y-3.5">
            {ex.speakerA && (
              <div className="surface-icy p-4 rounded-2xl text-xs font-latin space-y-1" dir="ltr">
                <p className="font-semibold text-slate-900">{ex.speakerA}</p>
                <p className="text-slate-600">{ex.speakerBBlank}</p>
              </div>
            )}

            <div className="space-y-2">
              {optionsList.map((opt: any, i: number) => {
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isSelected = selectedOptionId === optText;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOptionId(optText)}
                    className={`w-full p-3.5 rounded-2xl border text-right text-xs sm:text-sm transition-colors ${
                      isAnswerChecked && optText === ex.correctAnswer
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                        : isSelected
                        ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
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
    <div className="space-y-5 text-right">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
        {exercise.instructionAr}
      </h3>

      {renderBody()}

      {exercise.type !== 'pronunciation_practice' && !isAnswerChecked && (
        <div className="pt-2">
          <button
            type="button"
            onClick={checkAnswer}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            تحقق من الإجابة
          </button>
        </div>
      )}

      {isAnswerChecked && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isCorrect
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>إجابة صحيحة!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تحتاج لمراجعة — تمت إضافتها إلى سجل المراجعة المخصصة.</span>
              </>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t border-current/15">
            <p>
              <strong>الجملة الإنجليزية:</strong>{' '}
              <span className="font-latin" dir="ltr">
                {exercise.englishSentence}
              </span>
            </p>
            <p>
              <strong>الترجمة العربية:</strong> {exercise.arabicTranslation}
            </p>
            <p className="opacity-90">
              <strong>توضيح القاعدة:</strong> {exercise.explanationAr}
            </p>
          </div>

          {!isCorrect && (
            <div className="pt-2 space-y-3">
              {!diagnosis && (
                <button
                  type="button"
                  onClick={handleAnalyzeMistake}
                  disabled={loadingDiagnosis}
                  className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-50 transition-colors"
                >
                  {loadingDiagnosis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                  )}
                  <span>لماذا أخطأت؟ تحليل الأستاذ وتمرين تحقق</span>
                </button>
              )}

              {diagnosisError && <p className="text-red-700">{diagnosisError}</p>}

              {diagnosis && (
                <div className="p-4 rounded-xl bg-white border border-sky-200 text-slate-800 space-y-3">
                  <p className="font-bold text-slate-900">{diagnosis.underlyingMisconceptionAr}</p>
                  <p className="text-slate-600 leading-relaxed">{diagnosis.contrastRuleAr}</p>
                  {diagnosis.contrastExamples?.length > 0 && (
                    <div className="space-y-1.5">
                      {diagnosis.contrastExamples.map((ce, ci) => (
                        <div key={ci} className="p-2.5 rounded-lg bg-[#F0F7FA]/70 border border-sky-100 space-y-0.5">
                          <p className="font-latin" dir="ltr">
                            <span className="line-through text-red-700">{ce.wrongEn}</span>{' → '}
                            <span className="font-bold text-emerald-800">{ce.rightEn}</span>
                          </p>
                          <p className="text-slate-700">{ce.arabic} — {ce.reasonAr}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {diagnosis.verificationQuestion && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="font-semibold text-slate-900">
                        تحقق فوري: {diagnosis.verificationQuestion.questionAr}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {diagnosis.verificationQuestion.options.map(opt => {
                          const selected = verifyOpt === opt;
                          const right = opt === diagnosis.verificationQuestion.correctAnswer;
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={verifyChecked}
                              onClick={() => setVerifyOpt(opt)}
                              dir="ltr"
                              className={`p-2.5 rounded-xl border text-left font-latin text-xs font-semibold ${
                                verifyChecked && right
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                                  : verifyChecked && selected
                                  ? 'bg-red-50 border-red-400 text-red-900'
                                  : selected
                                  ? 'bg-[#F0F7FA] border-sky-500 text-slate-900'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {!verifyChecked && (
                        <button
                          type="button"
                          disabled={!verifyOpt}
                          onClick={() => setVerifyChecked(true)}
                          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-40"
                        >
                          تأكيد الفهم
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ExerciseEngineProps {
  onOpenAssistant: (sentence?: SentenceItem) => void;
}

export const ExerciseEngine: React.FC<ExerciseEngineProps> = ({ onOpenAssistant }) => {
  const { progress, recordExerciseResult } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExercise = EXERCISES_COLLECTION[currentIndex] || EXERCISES_COLLECTION[0];

  // Adaptive exercise generator mode
  const [adaptiveExercise, setAdaptiveExercise] = useState<AdaptiveGeneratedExercise | null>(null);
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);
  const [adaptiveError, setAdaptiveError] = useState<string | null>(null);
  const [adaptiveSelectedOpt, setAdaptiveSelectedOpt] = useState<string | null>(null);
  const [adaptiveChecked, setAdaptiveChecked] = useState(false);
  const [previousAdaptivePrompts, setPreviousAdaptivePrompts] = useState<string[]>([]);

  const handleGenerateAdaptive = async () => {
    setLoadingAdaptive(true);
    setAdaptiveError(null);
    setAdaptiveSelectedOpt(null);
    setAdaptiveChecked(false);
    try {
      const weakCategories = Object.values(progress.errorPatterns)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(p => p.categoryAr);

      const generated = await fetchAdaptiveExercise({
        topicId: currentExercise.topicId,
        topicTitleAr: currentExercise.topicTitleAr,
        topicTitleEn: currentExercise.topicId,
        cefrLevel: progress.cefrLevel,
        weakCategories,
        previousPrompts: previousAdaptivePrompts
      });
      setAdaptiveExercise(generated);
      setPreviousAdaptivePrompts(prev => [...prev.slice(-8), generated.questionAr]);
    } catch (err: any) {
      setAdaptiveError(err?.message || 'تعذر توليد تمرين تكيّفي جديد حالياً.');
    } finally {
      setLoadingAdaptive(false);
    }
  };

  const handleAskAssistant = () => {
    const contextSentence: SentenceItem = {
      id: currentExercise.id,
      topicId: currentExercise.topicId,
      english: adaptiveExercise?.englishSentence || currentExercise.englishSentence,
      arabic: adaptiveExercise?.arabicTranslation || currentExercise.arabicTranslation,
      source: currentExercise.source,
      level: currentExercise.level,
      topicNameAr: currentExercise.topicTitleAr,
      topicNameEn: currentExercise.topicId,
      contextAr: adaptiveExercise?.deepExplanationAr || currentExercise.explanationAr,
      vocabulary: []
    };
    onOpenAssistant(contextSentence);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6" dir="rtl">
      <div className="surface-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
            <span className="text-sky-700 font-semibold font-numeric">
              {adaptiveExercise
                ? `تمرين تكيّفي (${adaptiveExercise.cefrLevel})`
                : `تمرين ${currentIndex + 1} من ${EXERCISES_COLLECTION.length}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentExercise.topicTitleAr}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAdaptive}
              disabled={loadingAdaptive}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loadingAdaptive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-sky-300" />
              )}
              <span>توليد تمرين تكيّفي جديد</span>
            </button>

            <button
              type="button"
              onClick={handleAskAssistant}
              className="px-3.5 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200/80 text-xs font-semibold text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>اسأل المساعد الذكي</span>
            </button>
          </div>
        </div>

        {adaptiveError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            {adaptiveError}
          </div>
        )}

        {adaptiveExercise ? (
          <div className="space-y-5 text-right">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-sky-700 font-semibold">
                تمرين تكيّفي مُصمّم لمستواك ونقاط المراجعة
              </span>
              <button
                type="button"
                onClick={() => setAdaptiveExercise(null)}
                className="text-xs text-slate-500 hover:text-slate-900 underline"
              >
                العودة للتمارين الأساسية
              </button>
            </div>

            <div className="surface-icy p-4 rounded-2xl space-y-1.5">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {adaptiveExercise.questionAr}
              </p>
              {adaptiveExercise.promptEn && (
                <p className="text-sm font-latin font-semibold text-slate-800" dir="ltr">
                  {adaptiveExercise.promptEn}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {adaptiveExercise.options.map(opt => {
                const selected = adaptiveSelectedOpt === opt.id;
                const right = opt.id === adaptiveExercise.correctOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={adaptiveChecked}
                    onClick={() => setAdaptiveSelectedOpt(opt.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-colors space-y-1 ${
                      adaptiveChecked && right
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                        : adaptiveChecked && selected
                        ? 'border-red-400 bg-red-50 text-red-900'
                        : selected
                        ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white hover:border-sky-300 text-slate-800'
                    }`}
                  >
                    <span className="block font-latin font-semibold text-sm" dir="ltr">
                      {opt.text}
                    </span>
                    {adaptiveChecked && (
                      <span className="block text-[11px] text-slate-600">{opt.distractorReasonAr}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {!adaptiveChecked ? (
              <button
                type="button"
                disabled={!adaptiveSelectedOpt}
                onClick={() => {
                  const ok = adaptiveSelectedOpt === adaptiveExercise.correctOptionId;
                  setAdaptiveChecked(true);
                  recordExerciseResult(
                    ok,
                    ok
                      ? undefined
                      : {
                          sentenceId: `adapt_${Date.now()}`,
                          english: adaptiveExercise.englishSentence,
                          arabic: adaptiveExercise.arabicTranslation,
                          topicTitleAr: currentExercise.topicTitleAr,
                          explanationAr: adaptiveExercise.deepExplanationAr,
                          errorCategory: 'tense_agreement'
                        },
                    'grammar'
                  );
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl disabled:opacity-40"
              >
                تحقق من الإجابة
              </button>
            ) : (
              <div className="p-4 rounded-2xl border border-sky-200 bg-[#F0F7FA]/60 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-latin font-bold text-sm text-slate-900" dir="ltr">
                    {adaptiveExercise.englishSentence}
                  </p>
                  <button
                    type="button"
                    onClick={() => playEnglishAudio(adaptiveExercise.englishSentence)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-sky-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-semibold text-slate-800">{adaptiveExercise.arabicTranslation}</p>
                <p className="text-slate-700 leading-relaxed">{adaptiveExercise.deepExplanationAr}</p>
              </div>
            )}
          </div>
        ) : (
          <ExerciseCardRenderer exercise={currentExercise} />
        )}

        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setAdaptiveExercise(null);
              setCurrentIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0 && !adaptiveExercise}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            <span>التمرين السابق</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAdaptiveExercise(null);
              setCurrentIndex(prev => (prev < EXERCISES_COLLECTION.length - 1 ? prev + 1 : 0));
            }}
            className="px-5 py-2.5 bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200 text-slate-900 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
          >
            <span>التمرين التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
