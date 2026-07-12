import { useState } from "react";
import { Department } from "../types";
import { ChevronRight, ChevronDown, Folder, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TreeViewProps {
  groupedDepartments: [string, Department[]][];
  searchQuery: string;
  onDeptSelect: (dept: Department) => void;
}

export default function TreeView({ groupedDepartments, searchQuery, onDeptSelect }: TreeViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
      {groupedDepartments.length > 0 ? (
        <div className="space-y-2">
          {groupedDepartments.map(([orgName, depts]) => (
            <OrgNode key={orgName} orgName={orgName} depts={depts} hasSearch={!!searchQuery.trim()} onDeptSelect={onDeptSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

function OrgNode({ orgName, depts, hasSearch, onDeptSelect }: { orgName: string; depts: Department[]; hasSearch: boolean; onDeptSelect: (dept: Department) => void }) {
  const [isExpanded, setIsExpanded] = useState(hasSearch);

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
        <Folder className="w-4 h-4 text-teal-600 shrink-0" />
        <span className="font-bold text-slate-800">{orgName}</span>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full ml-auto">
          {depts.length}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 pl-6 md:pl-8 space-y-1 bg-white border-t border-slate-100">
              {depts.map((dept) => (
                <DeptNode key={dept.id} dept={dept} hasSearch={hasSearch} onDeptSelect={onDeptSelect} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeptNode({ dept, hasSearch, onDeptSelect }: { dept: Department; hasSearch: boolean; onDeptSelect: (dept: Department) => void }) {
  const [isExpanded, setIsExpanded] = useState(hasSearch);
  const hasChildren = !!dept.head || dept.teams.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 hover:bg-slate-50 rounded px-2 -mx-2 transition-colors group">
        {hasChildren ? (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 rounded hover:bg-slate-200">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        ) : (
          <div className="w-4.5" /> // spacer
        )}
        <Users className="w-4 h-4 text-blue-500 shrink-0" />
        <button onClick={() => onDeptSelect(dept)} className="font-medium text-slate-700 hover:text-teal-600 hover:underline text-left">
          {dept.deptName}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 space-y-1 pb-2 relative before:absolute before:left-2.5 before:top-0 before:bottom-2 before:w-px before:bg-slate-200">
              {dept.head && (
                <div className="flex items-center gap-2 py-1 relative">
                  <div className="absolute left-[-14px] top-1/2 w-3 h-px bg-slate-200" />
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <button onClick={() => onDeptSelect(dept)} className="text-sm font-medium text-slate-800 hover:text-teal-600 hover:underline text-left">
                    {dept.head.name}
                  </button>
                  <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{dept.head.rank}</span>
                  {dept.head.phone && <span className="text-xs text-slate-400 ml-auto hidden sm:inline-block">{dept.head.phone}</span>}
                  {dept.head.ext && <span className="text-xs text-slate-400 ml-2 hidden sm:inline-block">내선: {dept.head.ext}</span>}
                </div>
              )}
              {dept.teams.map((team, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 py-1 relative">
                    <div className="absolute left-[-14px] top-1/2 w-3 h-px bg-slate-200" />
                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600">{team.teamName}</span>
                  </div>
                  {team.leader && (
                    <div className="flex items-center gap-2 py-1 pl-6 relative">
                      <div className="absolute left-[10px] top-0 bottom-0 w-px bg-slate-200" />
                      <div className="absolute left-[10px] top-1/2 w-3 h-px bg-slate-200" />
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button onClick={() => onDeptSelect(dept)} className="text-sm font-medium text-slate-800 hover:text-teal-600 hover:underline text-left">
                        {team.leader.name}
                      </button>
                      <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{team.leader.rank}</span>
                      {team.leader.phone && <span className="text-xs text-slate-400 ml-auto hidden sm:inline-block">{team.leader.phone}</span>}
                      {team.leader.ext && <span className="text-xs text-slate-400 ml-2 hidden sm:inline-block">내선: {team.leader.ext}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
