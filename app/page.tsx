"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Check, Download, Loader2 } from "lucide-react";

// --- Types ---

interface Exercise {
  name: string;
  sets: string | number;
  reps: string | number;
  rest: string;
  intensity: string;
  notes: string;
}

interface DaySchedule {
  day_number: number;
  day_name: string;
  exercises: Exercise[];
}

interface GeneratedMenu {
  rationale: string;
  schedule: DaySchedule[];
  week_4_deload_modifications: string;
}

interface FormData {
  level: string;
  goal: string;
  period: string;
  days: string;
  duration: string;
  environment: string;
  healthStatus: string;
  benchPress1RM: string;
  squat1RM: string;
  deadlift1RM: string;
}

interface SelectionCardProps {
  label: string;
  description?: string;
  active?: boolean;
  onClick: () => void;
}

// --- Component ---

export default function TrainingApp() {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showResult, setShowResult] = useState(false);
  const [generatedMenu, setGeneratedMenu] = useState<GeneratedMenu | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define totalSteps constant
  const totalSteps = 6;

  // Form State
  const [formData, setFormData] = useState<FormData>({
    level: "",
    goal: "",
    period: "4週間",
    days: "3",
    duration: "60分",
    environment: "",
    healthStatus: "良好", // Simplified for now
    benchPress1RM: "",
    squat1RM: "",
    deadlift1RM: "",
  });

  // Generation Simulation / Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isGenerating, countdown]);

  const handleStart = () => {
    // Explicitly set state
    setStep(1);
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCountdown(15);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      setGeneratedMenu(data);
      setShowResult(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("メニューの作成に失敗してしまいました。もう一度試してみてください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatWeight = (intensity: string, exerciseName: string) => {
    const nameLower = exerciseName.toLowerCase();
    let oneRM = 0;

    if (nameLower.includes("squat") && formData.squat1RM) oneRM = parseFloat(formData.squat1RM);
    else if (nameLower.includes("bench") && formData.benchPress1RM) oneRM = parseFloat(formData.benchPress1RM);
    else if (nameLower.includes("deadlift") && formData.deadlift1RM) oneRM = parseFloat(formData.deadlift1RM);

    const match = intensity.match(/(\d+)%\s*1RM/i);
    if (match && oneRM > 0) {
      const percent = parseInt(match[1]) / 100;
      const weight = Math.round(oneRM * percent);
      return `${intensity} (${weight}kg)`;
    }

    return intensity;
  };

  // --- UI Components ---
  const SelectionCard = ({ label, description, active, onClick }: SelectionCardProps) => (
    <div
      onClick={onClick}
      role="button"
      className={`w-full p-4 text-left border rounded-lg transition-all cursor-pointer ${
        active ? "border-slate-900 bg-slate-50 shadow-sm" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="font-semibold text-slate-900">{label}</div>
      {description && <div className="text-sm text-slate-500 mt-1">{description}</div>}
    </div>
  );

  // --- Views ---

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-right-4 duration-500 pt-10 px-4">
      {/* 1. Top Screen */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-700">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">Training Menu AI</h1>
          <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
            NSCAガイドラインに準拠した科学的なプログラムを、AIがあなたの環境に合わせて生成します。
          </p>
          <button
            onClick={handleStart}
            type="button"
            className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:scale-105"
          >
            ゲストとして開始する
          </button>
        </div>
      )}

      {/* 2. Generating */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-500">
          <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">メニューを精査中</h2>
            <p className="text-slate-500 mt-2">NSCAの基準に照らし合わせ、最適な種目構成を組み立てています...</p>
          </div>
          <div className="text-4xl font-mono font-bold text-slate-300">{countdown > 0 ? countdown : "Finalizing..."}</div>
        </div>
      )}

      {/* 3. Result Screen */}
      {showResult && generatedMenu && !isGenerating && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-1000 pb-20">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">生成されたプログラム</h1>
              <p className="text-slate-500 mt-1">{formData.goal} / {formData.period}プラン</p>
            </div>
            <button
              onClick={() => window.print()}
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition">
              <Download className="w-4 h-4" /> PDF保存
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">設計意図 / Justification</h3>
            <p className="text-slate-700 leading-relaxed">
              {generatedMenu.rationale}
            </p>
            {generatedMenu.week_4_deload_modifications && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 mb-2">Week 4 (Deload) Modifications:</h4>
                <p className="text-slate-600 text-sm">{generatedMenu.week_4_deload_modifications}</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {generatedMenu.schedule.map((day, idx) => (
              <div key={idx} className="overflow-hidden border border-slate-200 rounded-xl">
                <div className="bg-slate-100 px-6 py-3 font-bold text-slate-700 border-b border-slate-200">
                  {day.day_name}
                </div>
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">種目名</th>
                      <th className="px-6 py-4 font-semibold">強度 (RIR/重量)</th>
                      <th className="px-6 py-4 font-semibold">セット × 回数</th>
                      <th className="px-6 py-4 font-semibold">休憩</th>
                      <th className="px-6 py-4 font-semibold">メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {day.exercises.map((ex, exIdx) => (
                      <tr key={exIdx}>
                        <td className="px-6 py-4 font-semibold text-slate-900">{ex.name}</td>
                        <td className="px-6 py-4">{formatWeight(ex.intensity, ex.name)}</td>
                        <td className="px-6 py-4">{ex.sets} × {ex.reps}</td>
                        <td className="px-6 py-4">{ex.rest}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{ex.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-600 mb-6 font-medium">このメニューを保存して、成長を記録しませんか？</p>
            <button
              onClick={() => window.print()}
              type="button"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition shadow-lg">
              <Download className="w-5 h-5" /> PDFとして保存
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !showResult && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-500">
            <div className="text-red-500 text-xl font-bold">Oops!</div>
            <p className="text-slate-600">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} type="button" className="underline">戻る</button>
        </div>
      )}

      {/* Steps (1-6) */}
      {step > 0 && !isGenerating && !showResult && (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              <span>Question {step} / {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
          </div>

          <div className="min-h-[400px]">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-900">現在のレベルを教えてください</h2>
                <div className="grid gap-3">
                  <SelectionCard label="初心者" description="トレーニング歴 2ヶ月未満（週1～2回程度）" onClick={() => { setFormData({...formData, level: "Beginner"}); nextStep(); }} />
                  <SelectionCard label="中級者" description="トレーニング歴 2～6ヶ月（週2～3回程度）" onClick={() => { setFormData({...formData, level: "Intermediate"}); nextStep(); }} />
                  <SelectionCard label="上級者" description="トレーニング歴 1年以上（継続的な経験あり）" onClick={() => { setFormData({...formData, level: "Advanced"}); nextStep(); }} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-900">目的を選択してください</h2>
                <div className="grid gap-3">
                  {["筋肥大 (Hypertrophy)", "最大筋力 (Strength)", "パワー (Power)", "筋持久力 (Endurance)"].map((goal) => (
                    <SelectionCard key={goal} label={goal} onClick={() => { setFormData({...formData, goal}); nextStep(); }} />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900">環境と頻度</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">トレーニング環境</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setFormData({...formData, environment: "Gym"})}
                                    type="button"
                                    className={`p-3 border rounded-lg ${formData.environment === "Gym" ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                                    ジム (Gym)
                                </button>
                                <button
                                    onClick={() => setFormData({...formData, environment: "Home"})}
                                    type="button"
                                    className={`p-3 border rounded-lg ${formData.environment === "Home" ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                                    自宅 (Home)
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">週の頻度: {formData.days}日</label>
                            <input
                                type="range" min="1" max="6" step="1"
                                value={formData.days}
                                onChange={(e) => setFormData({...formData, days: e.target.value})}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">1回の時間: {formData.duration}</label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="30分">30分</option>
                                <option value="45分">45分</option>
                                <option value="60分">60分</option>
                                <option value="90分">90分</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={nextStep} disabled={!formData.environment} type="button" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold disabled:opacity-50">次へ</button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900">1RMの入力 (任意)</h2>
                    <p className="text-slate-500">正確な重量設定のために、もし分かれば入力してください。分からなければ空欄で構いません。</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">スクワット (kg)</label>
                            <input
                                type="number"
                                placeholder="Example: 100"
                                className="w-full p-3 border rounded-lg"
                                value={formData.squat1RM}
                                onChange={(e) => setFormData({...formData, squat1RM: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">ベンチプレス (kg)</label>
                            <input
                                type="number"
                                placeholder="Example: 80"
                                className="w-full p-3 border rounded-lg"
                                value={formData.benchPress1RM}
                                onChange={(e) => setFormData({...formData, benchPress1RM: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">デッドリフト (kg)</label>
                            <input
                                type="number"
                                placeholder="Example: 120"
                                className="w-full p-3 border rounded-lg"
                                value={formData.deadlift1RM}
                                onChange={(e) => setFormData({...formData, deadlift1RM: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button onClick={nextStep} type="button" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">次へ</button>
                    </div>
                </div>
            )}

            {step === 5 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900">健康状態の確認</h2>
                     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        運動に支障のある怪我や病気はありませんか？医師から運動を制限されている場合は、必ず医師の指示に従ってください。
                     </div>
                     <div className="grid gap-3">
                        <SelectionCard label="健康です (問題なし)" onClick={() => { setFormData({...formData, healthStatus: "Healthy"}); nextStep(); }} />
                        <SelectionCard label="不安がある (要相談)" onClick={() => { setFormData({...formData, healthStatus: "Some issues"}); nextStep(); }} />
                     </div>
                 </div>
            )}

            {step === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-900">準備が整いました</h2>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> NSCAガイドラインの適用</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 時間管理ロジックの展開 ({formData.duration})</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> ピリオダイゼーションの構築 ({formData.period})</li>
                  </ul>
                </div>
                <button
                  onClick={handleGenerate}
                  type="button"
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 transition shadow-xl"
                >
                  メニューを生成する
                </button>
              </div>
            )}
          </div>

          <button onClick={prevStep} type="button" className="flex items-center gap-1 text-slate-400 hover:text-slate-900 transition font-medium">
            <ChevronLeft className="w-4 h-4" /> 戻る
          </button>
        </>
      )}
    </div>
  );
}
