export interface StaffingInstructor {
  id: string;
  full_name: string;
  phone: string | null;
  work_cities: string | null;
}

export interface StaffingCandidate {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  area: string | null;
}

export interface StaffingClient {
  id: string;
  name: string;
  region: string | null;
}
