"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, Download, LogIn, Loader2 } from "lucide-react";

export default function TrainingApp() {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showResult, setShowResult] = useState(false);

  // フォームの状態管理
  const [formData, setFormData] = useState({
    level: "",
    goal: "",
    period: "",
    days: "3",
    duration: "1時間",
    environment: "",
    healthStatus: "",
    benchPress1RM: "",
    squat1RM: "",
    deadlift1RM: "",
  });

  // 生成シミュレーション
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsGenerating(false);
      setShowResult(true);
    }
    return () => clearInterval(timer);
  }, [isGenerating, countdown]);

  const handleStart = () => setStep(1);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // --- UI Components ---

  // Notionスタイルのカードボタン
  const SelectionCard = ({ label, description, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left border rounded-lg transition-all ${
        active ? "border-slate-900 bg-slate-50 shadow-sm" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="font-semibold text-slate-900">{label}</div>
      {description && <div className="text-sm text-slate-500 mt-1">{description}</div>}
    </button>
  );

  // --- Views ---

  // 1. トップ画面
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-700">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">トレーニングメニュー作成</h1>
        <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
          NSCAガイドラインに準拠した科学的なプログラムを、AIがあなたの環境に合わせて生成します。
        </p>
        <button
          onClick={handleStart}
          className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:scale-105"
        >
          ゲストとして開始する
        </button>
      </div>
    );
  }

  // 2. 生成中（ローディング）
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-500">
        <Loader2 className="w-12 h-12 animate-spin text-slate-400" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">メニューを精査中</h2>
          <p className="text-slate-500 mt-2">NSCAの基準に照らし合わせ、最適な種目構成を組み立てています...</p>
        </div>
        <div className="text-4xl font-mono font-bold text-slate-300">{countdown}</div>
      </div>
    );
  }

  // 3. 結果表示
  if (showResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-1000">
        <div className="flex justify-between items-end border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">生成されたプログラム</h1>
            <p className="text-slate-500 mt-1">{formData.goal} / {formData.period}プラン</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition">
            <Download className="w-4 h-4" /> PDF保存
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">設計意図 / Justification</h3>
          <p className="text-slate-700 leading-relaxed">
            NSCAの原則に基づき、大筋群から小筋群への順序を遵守。{formData.goal}に最適な強度設定と、
            セッション時間（{formData.duration}）を最大限に活用したボリューム構成です。
          </p>
        </div>

        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">種目名</th>
                <th className="px-6 py-4 font-semibold">強度 (RIR/重量)</th>
                <th className="px-6 py-4 font-semibold">セット × 回数</th>
                <th className="px-6 py-4 font-semibold">休憩</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-900">バックスクワット</td>
                <td className="px-6 py-4">75% 1RM (80kg)</td>
                <td className="px-6 py-4">3 × 10</td>
                <td className="px-6 py-4">2分</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-900">ベンチプレス</td>
                <td className="px-6 py-4">75% 1RM (60kg)</td>
                <td className="px-6 py-4">3 × 10</td>
                <td className="px-6 py-4">2分</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-900">ラットプルダウン</td>
                <td className="px-6 py-4">中強度 (RIR 2)</td>
                <td className="px-6 py-4">3 × 12</td>
                <td className="px-6 py-4">1分</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-slate-600 mb-6 font-medium">このメニューを保存して、成長を記録しませんか？</p>
          <button className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition shadow-lg">
            <LogIn className="w-5 h-5" /> Googleでログインして保存
          </button>
        </div>
      </div>
    );
  }

  // 4. 入力フォーム（Step 1 - 5）
  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          <span>Question {step} / 5</span>
          <span>{Math.round((step / 5) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">現在のレベルを教えてください</h2>
            <div className="grid gap-3">
              <SelectionCard label="初心者" description="トレーニング歴 2ヶ月未満（週1～2回程度）" onClick={nextStep} />
              <SelectionCard label="中級者" description="トレーニング歴 2～6ヶ月（週2～3回程度）" onClick={nextStep} />
              <SelectionCard label="上級者" description="トレーニング歴 1年以上（継続的な経験あり）" onClick={nextStep} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">目的と期間を選択してください</h2>
            <div className="grid gap-3">
              {["筋肥大", "最大筋力", "パワー", "筋持久力"].map((goal) => (
                <SelectionCard key={goal} label={goal} onClick={() => { setFormData({...formData, goal}); nextStep(); }} />
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">準備が整いました</h2>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> NSCAガイドラインの適用</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 時間管理ロジックの展開</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> ピリオダイゼーションの構築</li>
              </ul>
            </div>
            <button
              onClick={handleGenerate}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 transition shadow-xl"
            >
              メニューを生成する
            </button>
          </div>
        )}
      </div>

      {step > 0 && (
        <button onClick={prevStep} className="flex items-center gap-1 text-slate-400 hover:text-slate-900 transition font-medium">
          <ChevronLeft className="w-4 h-4" /> 戻る
        </button>
      )}
    </div>
  );
}# program
