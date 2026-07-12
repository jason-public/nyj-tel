import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Department, Employee, Team } from "../types";
import { initialCsvData } from "../data/initialData";
import { generateId } from "../lib/utils";

interface AppState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  departments: Department[];
  favorites: string[]; // employee ids
  syncUrl: string;
  setSyncUrl: (url: string) => void;
  syncFromUrl: () => Promise<boolean>;
  login: (password: string) => boolean;
  adminLogin: (password: string) => boolean;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  loadData: (csvText: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isAdmin: false,
      departments: [],
      favorites: [],
      syncUrl: "",
      
      setSyncUrl: (url) => set({ syncUrl: url }),
      
      syncFromUrl: async () => {
        const state = useStore.getState();
        const url = state.syncUrl;
        if (!url) return false;
        try {
          const res = await fetch(url);
          if (!res.ok) return false;
          const csvText = await res.text();
          state.loadData(csvText);
          return true;
        } catch (e) {
          console.error("Sync failed", e);
          return false;
        }
      },
      
      login: (password) => {
        // Hardcoded common password for demo
        if (password === "1234") {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      adminLogin: (password) => {
        if (password === "admin1234") {
          set({ isAdmin: true, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => set({ isAuthenticated: false, isAdmin: false }),
      
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter(f => f !== id)
          : [...state.favorites, id]
      })),
      
      loadData: (csvText) => {
        const lines = csvText.split("\n").filter(l => l.trim() !== "");
        // skip header
        const dataLines = lines.slice(1);
        
        let currentOrg = "";
        let currentDeptName = "";
        let currentHeadRank = "";
        let currentHeadName = "";
        let currentHeadExt = "";
        let currentHeadPhone = "";
        
        const deptMap = new Map<string, Department>();

        dataLines.forEach(line => {
          // simple csv split (handles quotes if needed, but our data is simple)
          const cols = line.split(",").map(c => c.trim().replace(/\\t/g, ''));
          if (cols.length < 10) return;
          
          if (cols[0]) currentOrg = cols[0];
          if (cols[1]) currentDeptName = cols[1];
          if (cols[2]) currentHeadRank = cols[2];
          if (cols[3]) currentHeadName = cols[3];
          if (cols[4]) currentHeadExt = cols[4];
          if (cols[5]) currentHeadPhone = cols[5];
          
          const teamName = cols[6];
          const leaderName = cols[7];
          const leaderExt = cols[8];
          const leaderPhone = cols[9];

          let dept = deptMap.get(currentDeptName);
          if (!dept) {
            let head: Employee | null = null;
            if (currentHeadName && currentHeadName !== "-") {
               head = {
                 id: generateId(),
                 orgName: currentOrg,
                 departmentName: currentDeptName,
                 isHead: true,
                 name: currentHeadName,
                 rank: currentHeadRank,
                 ext: currentHeadExt,
                 phone: currentHeadPhone
               };
            }
            dept = {
              id: generateId(),
              orgName: currentOrg,
              deptName: currentDeptName,
              head,
              teams: []
            };
            deptMap.set(currentDeptName, dept);
          }
          
          if (teamName && leaderName) {
            dept.teams.push({
              teamName,
              leader: {
                id: generateId(),
                orgName: currentOrg,
                departmentName: currentDeptName,
                teamName,
                isHead: false,
                name: leaderName,
                rank: "팀장",
                ext: leaderExt,
                phone: leaderPhone
              }
            });
          }
        });
        
        set({ departments: Array.from(deptMap.values()) });
      }
    }),
    {
      name: "org-chart-storage",
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        favorites: state.favorites,
        departments: state.departments.length > 0 ? state.departments : undefined 
      }),
    }
  )
);

// Call once on load just in case
if (useStore.getState().departments.length === 0) {
  useStore.getState().loadData(initialCsvData);
}
