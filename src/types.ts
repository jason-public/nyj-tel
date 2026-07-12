export interface Employee {
  id: string;
  name: string;
  rank: string;
  ext: string;
  phone: string;
  isHead: boolean;
  orgName: string;
  departmentName: string;
  teamName?: string;
}

export interface Team {
  teamName: string;
  leader: Employee | null;
}

export interface Department {
  id: string;
  orgName: string;
  deptName: string;
  head: Employee | null;
  teams: Team[];
}
