export interface UserInterface {
    _id: string;
    employee_id: string;
    token: string,
    role: string,
    email: string,
    full_name: string;
    is_team_lead: boolean;
    is_team_manager: boolean;
    is_super_admin: boolean;
    designation_name: string;
    role_id: string;
}
