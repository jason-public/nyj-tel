import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Department, Employee, Team } from "../types";
import { initialCsvData, INITIAL_DATA_VERSION } from "../data/initialData";
import { generateId } from "../lib/utils";

interface AppState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  departments: Department[];
  favorites: string[]; // employee ids
  syncUrl: string;
  isDarkMode: boolean;
  dataVersion?: string;
  toggleDarkMode: () => void;
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
      isDarkMode: false,
      dataVersion: "v1",
      
      toggleDarkMode: () => set((state) => {
        const nextState = !state.isDarkMode;
        if (nextState) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: nextState };
      }),

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
          // Robustly split by comma and remove surrounding quotes/spaces/tabs
          const cols = line.split(",").map(c => c.replace(/^["'\s\t]+|["'\s\t]+$/g, '').trim());
          if (cols.length < 10) return;
          
          if (cols[0]) currentOrg = cols[0];
          
          if (cols[1]) {
            currentDeptName = cols[1];
            // Reset head info when a new department starts to prevent leaking from previous departments
            currentHeadRank = cols[2] || "";
            currentHeadName = cols[3] || "";
            currentHeadExt = cols[4] || "";
            currentHeadPhone = cols[5] || "";
          } else {
            // Subsequent rows of the same department
            if (cols[2]) currentHeadRank = cols[2];
            if (cols[3]) currentHeadName = cols[3];
            if (cols[4]) currentHeadExt = cols[4];
            if (cols[5]) currentHeadPhone = cols[5];
          }
          
          let teamName = "";
          let leaderName = "";
          let leaderExt = "";
          let leaderPhone = "";

          if (cols[6]) {
            teamName = cols[6];
            leaderName = cols[7] || "";
            leaderExt = cols[8] || "";
            leaderPhone = cols[9] || "";
          } else if (cols[7]) {
            teamName = cols[7];
            leaderName = cols[8] || "";
            leaderExt = cols[9] || "";
            leaderPhone = cols[10] || "";
          }

          // Use composite key (org + dept) to prevent merging identical department names across different organizations
          const deptKey = `${currentOrg}_${currentDeptName}`;
          let dept = deptMap.get(deptKey);
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
            deptMap.set(deptKey, dept);
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        favorites: state.favorites,
        isDarkMode: state.isDarkMode,
        departments: state.departments.length > 0 ? state.departments : undefined,
        dataVersion: state.dataVersion
      }),
    }
  )
);

// Call once on load just in case
const currentVersion = useStore.getState().dataVersion;
if (useStore.getState().departments.length === 0 || currentVersion !== INITIAL_DATA_VERSION) {
  useStore.getState().loadData(initialCsvData);
  useStore.setState({ dataVersion: INITIAL_DATA_VERSION });
}
