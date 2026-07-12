import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Star, Share2, Download, Phone, X, LayoutGrid, List } from "lucide-react";
import { Department, Employee } from "../types";
import { useStore } from "../store/useStore";
import { cn, isMobile } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ContactCardProps {
  department: Department;
}

export default function ContactCard({ department }: ContactCardProps) {
  const [activeTab, setActiveTab] = useState<"head" | "teams">("head");
  const [qrPhone, setQrPhone] = useState<string | null>(null);
  
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const handlePhoneClick = (phone: string) => {
    if (isMobile()) {
      window.location.href = `tel:${phone}`;
    } else {
      setQrPhone(phone);
    }
  };

  const handleShare = (emp: Employee) => {
    const text = `[${emp.orgName} ${emp.departmentName}]\n${emp.name} ${emp.rank}\n내선: ${emp.ext}\n모바일: ${emp.phone}`;
    if (navigator.share) {
      navigator.share({
        title: "연락처 공유",
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("연락처 정보가 복사되었습니다.");
    }
  };

  const handleVCard = (emp: Employee) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${emp.name}
ORG:${emp.orgName} ${emp.departmentName};
TITLE:${emp.rank}
TEL;TYPE=WORK,VOICE:${emp.ext}
TEL;TYPE=CELL,VOICE:${emp.phone}
END:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${emp.name}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const EmployeeRow = ({ emp }: { emp: Employee }) => {
    const isFav = favorites.includes(emp.id);
    
    const formattedExt = emp.ext ? (/^\d{4}$/.test(emp.ext) ? `031-590-${emp.ext}` : emp.ext) : "";

    return (
      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-teal-100 transition-colors group">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-slate-800 text-lg whitespace-nowrap">{emp.name}</span>
            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md whitespace-nowrap">
              {emp.rank}
            </span>
            {emp.teamName && (
              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md break-keep">
                {emp.teamName}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-slate-500 mt-1">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[11px] sm:text-xs bg-slate-200 px-1.5 py-0.5 rounded shrink-0">내선</span>
              {formattedExt ? (
                <a href={`tel:${formattedExt.replace(/-/g, '')}`} className="text-xs sm:text-sm truncate text-teal-600 hover:underline">{formattedExt}</a>
              ) : (
                <span className="text-xs sm:text-sm truncate">-</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[11px] sm:text-xs bg-slate-200 px-1.5 py-0.5 rounded shrink-0">모바일</span>
              {emp.phone ? (
                <a href={`tel:${emp.phone}`} className="text-xs sm:text-sm truncate text-teal-600 hover:underline">{emp.phone}</a>
              ) : (
                <span className="text-xs sm:text-sm truncate">-</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => handlePhoneClick(emp.phone)}
            className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(emp.id)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isFav ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <Star className={cn("w-4 h-4", isFav && "fill-current")} />
          </button>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-2 ml-2">
            <button onClick={() => handleShare(emp)} className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleVCard(emp)} className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-xs font-medium text-teal-600 mb-1">{department.orgName}</p>
          <h2 className="text-xl font-bold text-slate-800">{department.deptName}</h2>
        </div>

        <div className="p-4">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab("head")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                activeTab === "head" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              부서장
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                activeTab === "teams" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="w-4 h-4" />
              팀장 목록
            </button>
          </div>

          <div className="min-h-[120px]">
            <AnimatePresence mode="wait">
              {activeTab === "head" ? (
                <motion.div
                  key="head"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {department.head ? (
                    <EmployeeRow emp={department.head} />
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">부서장 정보가 없습니다.</div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="teams"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {department.teams.length > 0 ? (
                    department.teams.map((team, idx) => 
                      team.leader ? <EmployeeRow key={idx} emp={team.leader} /> : null
                    )
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">팀장 정보가 없습니다.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* QR Modal for PC */}
      <AnimatePresence>
        {qrPhone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800">전화 걸기</h3>
                <button onClick={() => setQrPhone(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <QRCodeSVG value={`tel:${qrPhone}`} size={180} level="M" />
                <p className="mt-4 text-sm text-slate-500 text-center">
                  스마트폰 카메라로 QR코드를 스캔하여<br />전화를 걸 수 있습니다.
                </p>
                <div className="mt-4 font-mono font-medium text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200">
                  {qrPhone}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
