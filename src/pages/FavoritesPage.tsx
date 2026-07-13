import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { Department, Employee } from "../types";
import ContactCard from "../components/ContactCard";
import { Star } from "lucide-react";

export default function FavoritesPage() {
  const departments = useStore((state) => state.departments);
  const favorites = useStore((state) => state.favorites);

  // We need to create mock departments for the favorites to reuse the ContactCard component,
  // or we can just filter departments that have favorite employees and only show those employees.
  // The ContactCard is designed to show a whole department.
  // If the user wants to see their favorite *people*, maybe a different card is better,
  // but let's filter departments that contain any favorites and highlight them, 
  // or construct a virtual department of just favorites.
  
  // Let's create virtual departments that ONLY contain the favorite employees,
  // to reuse the ContactCard component.
  
  const favoriteDepartments = useMemo(() => {
    if (favorites.length === 0) return [];
    
    const favDepts: Department[] = [];
    
    departments.forEach(dept => {
      let hasFav = false;
      const newDept: Department = { ...dept, teams: [] };
      
      if (dept.head && favorites.includes(dept.head.id)) {
        newDept.head = dept.head;
        hasFav = true;
      } else {
        newDept.head = null;
      }
      
      dept.teams.forEach(team => {
        if (team.leader && favorites.includes(team.leader.id)) {
          newDept.teams.push(team);
          hasFav = true;
        }
      });
      
      if (hasFav) {
        favDepts.push(newDept);
      }
    });
    
    return favDepts;
  }, [departments, favorites]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3">
          즐겨찾기
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400">자주 연락하는 직원들을 모아볼 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {favoriteDepartments.length > 0 ? (
          favoriteDepartments.map((dept) => (
            <ContactCard key={dept.id + "_fav"} department={dept} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-slate-500 dark:text-slate-400">즐겨찾기에 등록된 직원이 없습니다.<br/>조직도에서 별표를 눌러 추가해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
