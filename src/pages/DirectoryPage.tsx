import { useState, useMemo, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Search, Mic, MicOff, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import ContactCard from "../components/ContactCard";
import { getChosung } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DirectoryPage() {
  const departments = useStore((state) => state.departments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>("전체");
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const orgNames = useMemo(() => {
    const orgs = new Set<string>();
    departments.forEach(dept => {
      if (dept.orgName) orgs.add(dept.orgName);
    });
    return ["전체", ...Array.from(orgs)];
  }, [departments]);

  const handleVoiceSearch = () => {
    if (isListening) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저에서는 음성 검색을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;

    const query = searchQuery.toLowerCase().replace(/\s+/g, "");
    const isChosungQuery = /^[ㄱ-ㅎ]+$/.test(query);

    return departments.map(dept => {
      const matchString = (target: string) => {
        if (!target) return false;
        const normalizedTarget = target.toLowerCase().replace(/\s+/g, "");
        if (isChosungQuery) {
          return getChosung(normalizedTarget).includes(query);
        }
        return normalizedTarget.includes(query);
      };

      const orgMatches = matchString(dept.orgName) || matchString(dept.deptName);
      const headMatches = dept.head ? (matchString(dept.head.name) || matchString(dept.head.rank) || matchString(dept.head.ext) || matchString(dept.head.phone)) : false;
      const deptMatches = orgMatches || headMatches;

      // Search teams
      const matchingTeams = dept.teams.filter(team => {
        return matchString(team.teamName) ||
               (team.leader && (matchString(team.leader.name) || matchString(team.leader.rank) || matchString(team.leader.ext) || matchString(team.leader.phone)));
      });

      if (deptMatches || matchingTeams.length > 0) {
        return {
          ...dept,
          head: dept.head, // Always keep head for context
          teams: orgMatches ? dept.teams : matchingTeams
        };
      }

      return null;
    }).filter(Boolean) as typeof departments;
  }, [departments, searchQuery]);

  // Group by orgName
  const groupedDepartments = useMemo(() => {
    const groups = new Map<string, typeof departments>();
    filteredDepartments.forEach(dept => {
      const org = dept.orgName || "기타";
      if (!groups.has(org)) {
        groups.set(org, []);
      }
      groups.get(org)!.push(dept);
    });
    return Array.from(groups.entries());
  }, [filteredDepartments]);

  const scrollToOrg = (org: string) => {
    setSelectedOrg(org);
    if (org === "전체") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(`org-${org}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for header
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">통합 조직도</h1>
        <p className="text-slate-500">부서, 이름, 업무 등을 검색해보세요. 초성 검색도 지원합니다.</p>
      </div>

      <div className="relative mb-6 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색어 입력 (예: 김상수, 시민안전관, ㄱㅅㅅ)"
          className="block w-full pl-11 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow text-lg"
        />
        <button
          onClick={handleVoiceSearch}
          className={`absolute inset-y-0 right-2 my-auto h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${
            isListening ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>

      <div className="mb-8">
        <div className="relative max-w-sm">
          <select
            value={selectedOrg}
            onChange={(e) => scrollToOrg(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          >
            {orgNames.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {groupedDepartments.length > 0 ? (
          groupedDepartments.map(([org, depts]) => {
            const isSpecial = org === "시장" || org === "부시장";
            const isExpanded = isSpecial ? expandedOrgs[org] : true;

            const toggleExpand = () => {
              if (isSpecial) {
                setExpandedOrgs(prev => ({ ...prev, [org]: !prev[org] }));
              }
            };

            return (
              <div key={org} id={`org-${org}`} className="scroll-mt-[140px]">
                {isSpecial ? (
                  <button
                    onClick={toggleExpand}
                    className="w-full flex items-center justify-between text-left p-4 mb-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all group"
                  >
                    <h2 className="text-xl font-bold text-slate-800">{org}</h2>
                    <div className="p-2 rounded-full bg-slate-50 group-hover:bg-teal-50 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-teal-600" /> : <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-teal-600" />}
                    </div>
                  </button>
                ) : (
                  <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                    {org}
                  </h2>
                )}
                
                <AnimatePresence initial={false}>
                  {(!isSpecial || isExpanded) && (
                    <motion.div 
                      key="content"
                      initial={isSpecial ? { height: 0, opacity: 0 } : false}
                      animate={isSpecial ? { height: "auto", opacity: 1 } : false}
                      exit={isSpecial ? { height: 0, opacity: 0 } : false}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-2">
                        {depts.map((dept) => (
                          <ContactCard key={dept.id} department={dept} isSearch={!!searchQuery.trim()} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
