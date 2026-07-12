import { useState, useMemo, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Search, Mic, MicOff } from "lucide-react";
import ContactCard from "../components/ContactCard";
import { getChosung } from "../lib/utils";

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

    return departments.filter(dept => {
      const matchString = (target: string) => {
        if (!target) return false;
        const normalizedTarget = target.toLowerCase().replace(/\s+/g, "");
        if (isChosungQuery) {
          return getChosung(normalizedTarget).includes(query);
        }
        return normalizedTarget.includes(query);
      };

      // Search org name, dept name
      if (matchString(dept.orgName) || matchString(dept.deptName)) return true;

      // Search head
      if (dept.head) {
        if (matchString(dept.head.name) || matchString(dept.head.rank) || matchString(dept.head.ext)) return true;
      }

      // Search teams
      for (const team of dept.teams) {
        if (matchString(team.teamName)) return true;
        if (team.leader) {
          if (matchString(team.leader.name) || matchString(team.leader.rank) || matchString(team.leader.ext)) return true;
        }
      }

      return false;
    });
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

      <div className="mb-8 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 sticky top-[72px] z-10 bg-slate-50/80 backdrop-blur">
        <div className="flex gap-2 min-w-max">
          {orgNames.map((org) => (
            <button
              key={org}
              onClick={() => scrollToOrg(org)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedOrg === org
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {org}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {groupedDepartments.length > 0 ? (
          groupedDepartments.map(([org, depts]) => (
            <div key={org} id={`org-${org}`} className="scroll-mt-[140px]">
              <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                {org}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {depts.map((dept) => (
                  <ContactCard key={dept.id} department={dept} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
