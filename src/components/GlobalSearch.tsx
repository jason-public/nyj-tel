import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Building2, Phone } from "lucide-react";
import { useStore } from "../store/useStore";
import { getChosung } from "../lib/utils";
import { Employee, Department } from "../types";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const departments = useStore(state => state.departments);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { employees: [], depts: [] };
    const q = query.toLowerCase().replace(/\s+/g, "");
    const isChosungQuery = /^[ㄱ-ㅎ]+$/.test(q);

    const matchString = (target: string) => {
      if (!target) return false;
      const normalizedTarget = target.toLowerCase().replace(/\s+/g, "");
      if (isChosungQuery) {
        return getChosung(normalizedTarget).includes(q);
      }
      return normalizedTarget.includes(q);
    };

    const foundEmployees: Employee[] = [];
    const foundDepts: Department[] = [];

    departments.forEach(dept => {
      let deptMatched = false;
      if (matchString(dept.deptName) || matchString(dept.orgName)) {
        foundDepts.push(dept);
        deptMatched = true;
      }

      if (dept.head) {
        if (
          matchString(dept.head.name) ||
          matchString(dept.head.rank) ||
          matchString(dept.head.ext) ||
          matchString(dept.head.phone)
        ) {
          foundEmployees.push(dept.head);
        }
      }

      dept.teams.forEach(team => {
        if (!deptMatched && matchString(team.teamName)) {
          if (!foundDepts.find(d => d.id === dept.id)) {
            foundDepts.push(dept);
          }
        }
        if (team.leader) {
          if (
            matchString(team.leader.name) ||
            matchString(team.leader.rank) ||
            matchString(team.leader.ext) ||
            matchString(team.leader.phone)
          ) {
            foundEmployees.push(team.leader);
          }
        }
      });
    });

    return { employees: foundEmployees, depts: foundDepts };
  }, [query, departments]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="직원, 부서 통합 검색..."
          spellCheck={false}
          autoComplete="off"
          className="block w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {isOpen && query.trim() && (results.employees.length > 0 || results.depts.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[60vh] overflow-y-auto z-50 custom-scrollbar">
          {results.employees.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                직원 검색 결과
              </div>
              {results.employees.map(emp => (
                <div key={emp.id} className="flex flex-col px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                      {emp.name} <span className="text-slate-500 dark:text-slate-400 text-xs font-normal ml-1">{emp.rank}</span>
                    </span>
                    <a href={`tel:${emp.ext?.replace(/-/g, '')}`} className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
                      <Phone className="w-3 h-3" />
                      {emp.ext}
                    </a>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {emp.orgName} &gt; {emp.departmentName} {emp.teamName && `> ${emp.teamName}`}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {results.depts.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                부서 검색 결과
              </div>
              {results.depts.map(dept => (
                <div key={dept.id} className="flex flex-col px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                    {dept.deptName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Building2 className="w-3 h-3" />
                    {dept.orgName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {isOpen && query.trim() && results.employees.length === 0 && results.depts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center z-50">
          <p className="text-sm text-slate-500 dark:text-slate-400">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
