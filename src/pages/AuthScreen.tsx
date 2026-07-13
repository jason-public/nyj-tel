import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Lock, ArrowRight } from "lucide-react";

export default function AuthScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError("비밀번호가 일치하지 않습니다. (힌트: 1234)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-sm w-full">
        <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-2">
          스마트 조직도
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">
          접근을 위해 공통 암호를 입력해주세요.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:text-slate-900 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            접속하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
