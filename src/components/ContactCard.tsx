import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Star, Share2, Download, Phone, X, LayoutGrid, List, QrCode } from "lucide-react";
import { Department, Employee } from "../types";
import { useStore } from "../store/useStore";
import { cn, isMobile } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface ContactCardProps {
  department: Department;
  isSearch?: boolean;
}

export default function ContactCard({ department, isSearch }: ContactCardProps) {
  const [isTeamPopupOpen, setIsTeamPopupOpen] = useState(false);
  const [qrPhone, setQrPhone] = useState<string | null>(null);
  const [qrContact, setQrContact] = useState<Employee | null>(null);
  
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const getVCardData = (emp: Employee) => {
    const formattedExt = emp.ext ? (/^\d{4}$/.test(emp.ext) ? `031-590-${emp.ext}` : emp.ext) : "";
    return `BEGIN:VCARD
VERSION:3.0
FN:${emp.name}
ORG:${emp.orgName} ${emp.departmentName}${emp.teamName ? ` ${emp.teamName}` : ""};
TITLE:${emp.rank}
TEL;TYPE=WORK,VOICE:${formattedExt}
TEL;TYPE=CELL,VOICE:${emp.phone}
END:VCARD`;
  };

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
      <div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-teal-100 dark:hover:border-teal-800 transition-colors group">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base md:text-lg whitespace-nowrap shrink-0" title={emp.name}>{emp.name}</span>
            <span className="text-[11px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md whitespace-nowrap shrink-0">
              {emp.rank}
            </span>
            {emp.teamName && (
              <span className="text-[11px] px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded break-keep shrink-0">
                {emp.teamName}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">내선</span>
              {formattedExt ? (
                <button
                  onClick={() => handlePhoneClick(formattedExt)}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline hover:text-teal-700 dark:hover:text-teal-300 font-mono text-left cursor-pointer focus:outline-none shrink-0"
                  title={`${formattedExt} (클릭하여 전화걸기)`}
                >
                  {formattedExt}
                </button>
              ) : (
                <span className="text-xs text-slate-400 shrink-0">-</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">모바일</span>
              {emp.phone ? (
                <button
                  onClick={() => handlePhoneClick(emp.phone)}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline hover:text-teal-700 dark:hover:text-teal-300 font-mono text-left cursor-pointer focus:outline-none shrink-0"
                  title={`${emp.phone} (클릭하여 전화걸기)`}
                >
                  {emp.phone}
                </button>
              ) : (
                <span className="text-xs text-slate-400 shrink-0">-</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-3 pt-2 w-full justify-start border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={() => handlePhoneClick(emp.phone || formattedExt)}
            disabled={!emp.phone && !formattedExt}
            className={cn(
              "w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer focus:outline-none",
              (!emp.phone && !formattedExt)
                ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50"
            )}
            title="전화 걸기"
          >
            <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={() => toggleFavorite(emp.id)}
            className={cn(
              "w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer focus:outline-none",
              isFav ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/40" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
            title="즐겨찾기"
          >
            <Star className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", isFav && "fill-current")} />
          </button>
          <button
            onClick={() => setQrContact(emp)}
            className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer focus:outline-none"
            title="연락처 QR코드"
          >
            <QrCode className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <div className="flex items-center gap-1 sm:gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-1 sm:pl-1.5 ml-1 sm:ml-1.5 shrink-0">
            <button 
              onClick={() => handleShare(emp)} 
              className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer focus:outline-none" 
              title="공유"
            >
              <Share2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
            <button 
              onClick={() => handleVCard(emp)} 
              className="w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer focus:outline-none" 
              title="다운로드"
            >
              <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
          <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">{department.orgName}</p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{department.deptName}</h2>
        </div>

        <div className="p-4">
          <div className="min-h-[120px]">
            {department.head ? (
              <EmployeeRow emp={department.head} />
            ) : null}
            
            {!department.head && department.teams.length === 0 && (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">정보가 없습니다.</div>
            )}
            
            {department.teams.length > 0 && (
              isSearch ? (
                <div className="mt-3 space-y-3">
                  {department.teams.map((team, idx) => 
                    team.leader ? <EmployeeRow key={idx} emp={team.leader} /> : null
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsTeamPopupOpen(true)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 dark:bg-teal-900/30 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <List className="w-4 h-4" />
                  팀장 목록 보기
                </button>
              )
            )}
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
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">전화 걸기</h3>
                <button onClick={() => setQrPhone(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <QRCodeSVG value={`tel:${qrPhone}`} size={180} level="M" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                  스마트폰 카메라로 QR코드를 스캔하여<br />전화를 걸 수 있습니다.
                </p>
                <div className="mt-4 font-mono font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  {qrPhone}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Details QR Modal */}
      <AnimatePresence>
        {qrContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setQrContact(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl max-w-sm w-full relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-600" />
                  연락처 QR코드
                </h3>
                <button onClick={() => setQrContact(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-0.5">{qrContact.orgName} • {qrContact.departmentName}</p>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {qrContact.name} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{qrContact.rank}</span>
                </h4>
                {qrContact.teamName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{qrContact.teamName}</p>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="p-4 bg-white rounded-xl shadow-inner flex items-center justify-center">
                  <QRCodeSVG value={getVCardData(qrContact)} size={180} level="M" />
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  휴대폰 카메라로 QR코드를 스캔하면<br />
                  <span className="font-semibold text-teal-600 dark:text-teal-400">연락처에 자동으로 저장</span>할 수 있습니다.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    handleVCard(qrContact);
                    setQrContact(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  연락처 파일 저장
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Leaders Modal */}
      <AnimatePresence>
        {isTeamPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                  <List className="w-5 h-5 text-teal-600" />
                  {department.deptName} 팀장 목록
                </h3>
                <button onClick={() => setIsTeamPopupOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-3 flex-1">
                {department.teams.length > 0 ? (
                  department.teams.map((team, idx) => 
                    team.leader ? <EmployeeRow key={idx} emp={team.leader} /> : null
                  )
                ) : (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">팀장 정보가 없습니다.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
