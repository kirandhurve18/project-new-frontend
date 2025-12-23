export interface LeaveDetailsInterface {
    _id?: string;
    employee_id: string;
    leave_type: string,
    from_date: string,
    to_date: string,
    custom_dates: string[];
    leave_mode: string;
    half_day_start_time: string;
    half_day_end_time: string;
    reason: string;
    status: string;
    number_of_days: number;
    createdAt: string;
    manager_comment: string;
    rejection_reason: string;
    reviewer_comment: string;
    leave_id: string;
    full_name: string;
    updated_by_full_name: string;
    head_full_name: string;
    reviewer_full_name: string;
    designation_name: string;
    updated_by_head_id: string;
    updated_by_reviewer_id: string;
    updated_by_id: string;
}
