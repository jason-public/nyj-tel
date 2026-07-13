import React, { useState, useRef } from "react";
import { useStore } from "../store/useStore";
import { Upload, FileSpreadsheet, LogOut, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { generateId } from "../lib/utils";

export default function AdminPage() {
  const isAdmin = useStore((state) => state.isAdmin);
  const adminLogin = useStore((state) => state.adminLogin);
  const loadData = useStore((state) => state.loadData);
  const syncUrl = useStore((state) => state.syncUrl);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 max-w-sm w-full">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">관리자 로그인</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = adminLogin(password);
              if (!ok) setError("관리자 비밀번호가 일치하지 않습니다. (admin1234)");
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="관리자 비밀번호"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100"
              />
              {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Convert to CSV
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        loadData(csv);
        setSuccessMsg("데이터가 성공적으로 업데이트 되었습니다.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        console.error(err);
        alert("파일을 파싱하는 중 오류가 발생했습니다.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">관리자 설정</h1>
          <p className="text-slate-500 dark:text-slate-400">조직도 데이터를 관리하고 업데이트합니다.</p>
        </div>
        <button
          onClick={() => useStore.setState({ isAdmin: false })}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 dark:bg-slate-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-teal-600" />
          데이터 덮어쓰기 (엑셀 업로드)
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          기존 데이터를 완전히 덮어씁니다. 양식에 맞는 엑셀(.xlsx) 파일을 업로드해주세요.
          병합된 셀(부서명 등)은 시스템에서 자동으로 채워넣습니다(Forward Fill).
        </p>
        
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
          <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-4" />
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            파일 선택 및 업로드
          </label>
        </div>
        
        {successMsg && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          구글 시트 연동 (CSV URL)
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          구글 시트에서 '웹에 게시' 기능을 통해 생성한 CSV URL을 입력해두면, 
          사용자가 접속할 때마다 자동으로 최신 데이터를 동기화합니다.
        </p>
        <div className="flex gap-4">
          <input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
            value={syncUrl}
            onChange={(e) => useStore.getState().setSyncUrl(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100"
          />
          <button 
            onClick={async () => {
              const ok = await useStore.getState().syncFromUrl();
              if (ok) {
                setSuccessMsg("동기화 성공!");
                setTimeout(() => setSuccessMsg(""), 3000);
              } else {
                alert("동기화에 실패했습니다. URL을 확인해주세요.");
              }
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            수동 동기화
          </button>
        </div>
      </div>
    </div>
  );
}
