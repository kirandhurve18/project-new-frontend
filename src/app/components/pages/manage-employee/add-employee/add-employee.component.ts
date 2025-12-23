
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

interface Designation {
  _id: string;
  designation_name: string;
  departmentId: string;
  status: string;
}

interface SubDesignation {
  _id: string;
  sub_designation_name: string;
  status: string;
}

interface DocumentItem {
  key: string;
  name: string;
  file?: File;
  path?: string;
  file_name?: string;
  _id?: string;
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  userRole: string | null = null;
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;

  showPassword: boolean = false;
  
  constructor(private router: Router, private superadmin: Superadmin,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');

    if (!user) {
      this.router.navigate(['/login']);
    }


    this.loadDepartments();
    this.loadDesignations();
    this.loadSubDesignations();
    this.loadTeamLeads();// 🔹 fetch sub-designations dynamically
    this.loadTeamManagers();
    this.loadRoles();

    const currentUrl = this.router.url;
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id || currentUrl.includes('/updateinfo')) {
        this.isUpdateMode = true;
        // Load employee details by ID and populate formData if needed
      }
    });

  }

  isUpdateMode: boolean = false;

  // Documents list
  docs: DocumentItem[] = [
    { name: 'Aadhar Card', key: 'aadhar_card' },
    { name: 'PAN Card', key: 'pan_card' },
    { name: 'Passport Size Photo', key: 'passport_photo' },
    { name: 'Employee Email Signature', key: 'employee_sign' },
    { name: '10th Certificate', key: 'tenth_certificate' },
    { name: '12th Certificate', key: 'twelfth_certificate' },
    { name: 'Graduation Certificate', key: 'graduation_certificate' },
    { name: 'Resume', key: 'resume' },
    { name: 'Previous Offer Letter', key: 'previous_offer_letter' },
    { name: 'Previous Experience Letter', key: 'previous_experience_letter' },
    { name: 'Form16', key: 'form_16' },
  ];


  employment_type: string[] = ['FULLTIME', 'CONTRACT', 'INTERNSHIP'];


  departments: any[] = [];

  designations: Designation[] = [];


  sub_designations: SubDesignation[] = [];

  teamLeads: any[] = [];

  teamManagers: any[] = [];

  roles: any[] = [];

  bloodGroups: string[] = ['A+', 'B+', 'A-', 'B-', 'AB+', 'AB-', 'O-', 'O+'];

  qualifications: string[] = ['10th', '12th', 'Graduation', 'Post Graduation'];

  uploadedFiles: { [key: string]: File } = {};

  // Employee form data
  // formData: any = {
  //   employee_id: '',
  //   role_id: '',
  //   team_lead_id: '',
  //   team_managers_id:'',
  //   first_name: '',
  //   middle_name: '',
  //   last_name: '',
  //   company_email: '',
  //   password: '',
  //   personal_email: '',
  //   designations: '', 
  //   sub_designation: '', 
  //   is_team_lead: false,
  //   departments: '', 
  //   employment_type: '',
  //   employee_number: '',
  //   alternate_number: '',
  //   emergency_number: '',
  //   family_member_relation: '',
  //   current_address: '',
  //   is_current_add_same_as_permanent: true,
  //   permanent_address: '',
  //   date_of_birth: '',
  //   gender: '',
  //   blood_group: '',
  //   work_mode: '',
  //   date_of_joining: '',
  //   notice_period: '',
  //   work_experience: '',
  //   salary: '',
  //   bank_name: '',
  //   bank_account_number: '',
  //   ifsc_code: '',
  //   is_active: true,
  //   tenth_passing_year: '',
  //   tenth_percentage: '',
  //   twelfth_passing_year: '',
  //   twelfth_percentage: '',
  //   graduation_passing_year: '',
  //   graduation_percentage: '',
  //   post_graduation_passing_year: '',
  //   post_graduation_percentage: '',
  //   aadhar_card_number: '',
  //   pan_card_number: '',
  //   pf_account_number: '',
  //   uan_number: '',
  //   esi_number: '',
  //   assigned_menus: ['', ''],
  // };

  //    formData: any ={
  //   "employee_id": "EMP0876212",
  //   "role_id": "68b6e4d43105bcd8afd868f6",
  //   "team_lead_id": null,
  //   "team_managers_id": ["68b7bf35d2a0644277c6cabe"],
  //   "first_name": "Saniya",
  //   "middle_name": "P",
  //   "last_name": "Patel",
  //   "company_email": "saniya1234.patel@desteksolutions.com",
  //   "password": "saniya@123",
  //   "personal_email": "john.personjal@gmail.com",
  //   "designation_id": "68b5318426b5d1d4f731bf3b",
  //   "sub_designation_id": "68b6e6793105bcd8afd86905",
  //   "is_team_lead": false,
  //   "department_id": "68b5312626b5d1d4f731bf36",
  //   "employment_type": "FULLTIME",
  //   "employee_number": "123456",
  //   "alternate_number": "9876543210",
  //   "emergency_number": "9123456789",
  //   "family_member_relation": "Father",
  //   "current_address": "Office no 202B, Town Square, New Airport Rd, Mhada Colony, Viman Nagar, Pune, Maharashtra 411014",
  //   "is_current_add_same_as_permanent": true,
  //   "permanent_address": "123 Main Street, City",
  //   "date_of_birth": "2025-09-03T00:00:00.000Z",
  //   "gender": "Female",
  //   "blood_group": "AB+",
  //   "work_mode": "Office",
  //   "date_of_joining": "2025-09-04T00:00:00.000Z",
  //   "notice_period": 45,
  //   "work_experience": 5,
  //   "salary": 650000,
  //   "bank_name": "HDFC",
  //   "bank_account_number": "8965336589",
  //   "ifsc_code": "HDFC0001234",
  //   "is_active": true,
  //   "tenth_passing_year": 2018,
  //   "tenth_percentage": 91.20,
  //   "twelfth_passing_year": 2020,
  //   "twelfth_percentage": 73.23,
  //   "graduation_passing_year": 2024,
  //   "graduation_percentage": 81.70,
  //   "post_graduation_passing_year": 2026,
  //   "post_graduation_percentage": 78.23,
  //   "aadhar_card_number": "411561869826",
  //   "pan_card_number": "7896541236",
  //   "pf_account_number": "123654789",
  //   "uan_number": "8965231457",
  //   "esi_number": "1236589652",
  //   "assigned_menus": [],
  //   "probation_period_ends_on": "2025-09-16T00:00:00.000Z"
  // }

  formData: any = {
    "employee_id": "",
    "first_name": "",
    "middle_name": "",
    "last_name": "",
    "company_email": "",
    "password": "",
    "personal_email": "",
    "current_address": "",
    "permanent_address": "",
    "is_current_add_same_as_permanent": false,
    "date_of_birth": "",
    "date_of_joining": "",
    "proba tion_period_ends_on": "",
    "last_working_day": "",
    "notice_period": "",
    "role_id": "",
    "team_lead_id": "",
    "team_managers_id": [],
    "team_manager_id": "",
    "designation_id": "",
    "designation": "",
    "sub_designation": "",
    "sub_designation_id": "",
    "role": "",
    "is_team_lead": false,
    "is_team_manager": false,
    "is_super_admin": false,
    "department_id": "",
    "department": "",
    "employment_type": "",
    "employee_number": "",
    "alternate_number": "",
    "emergency_number": "",
    "family_member_relation": "",
    "gender": "Male",
    "blood_group": "",
    "work_mode": "WFO",
    "work_experience": "",
    "salary": "",
    "bank_name": "",
    "bank_account_number": "",
    "ifsc_code": "",
    "is_active": true,
    "tenth_passing_year": "",
    "tenth_percentage": "",
    "twelfth_passing_year": "",
    "twelfth_percentage": "",
    "graduation_passing_year": "",
    "graduation_percentage": "",
    "post_graduation_passing_year": "",
    "post_graduation_percentage": "",
    "aadhar_card_number": "",
    "pan_card_number": "",
    "pf_account_number": "",
    "uan_number": "",
    "esi_number": "",
    "assigned_menus": [],
  }

  qualificationMap: any = {
    '10th': {
      year: this.formData.tenth_passing_year || '',
      percentage: this.formData.tenth_percentage || '',
    },
    '12th': {
      year: this.formData.twelfth_passing_year || '',
      percentage: this.formData.twelfth_percentage || '',
    },
    Graduation: {
      year: this.formData.graduation_passing_year || '',
      percentage: this.formData.graduation_percentage || '',
    },
    'Post Graduation': {
      year: this.formData.post_graduation_passing_year || '',
      percentage: this.formData.post_graduation_percentage || '',
    },
  };

  syncQualificationData() {
    this.formData.tenth_passing_year = this.qualificationMap['10th'].year;
    this.formData.tenth_percentage = this.qualificationMap['10th'].percentage;

    this.formData.twelfth_passing_year = this.qualificationMap['12th'].year;
    this.formData.twelfth_percentage = this.qualificationMap['12th'].percentage;

    this.formData.graduation_passing_year = this.qualificationMap['Graduation'].year;
    this.formData.graduation_percentage = this.qualificationMap['Graduation'].percentage;

    this.formData.post_graduation_passing_year =
      this.qualificationMap['Post Graduation'].year;
    this.formData.post_graduation_percentage =
      this.qualificationMap['Post Graduation'].percentage;
  }


  prepareFormData() {
    return {
      ...this.formData,
      is_team_lead: this.formData.role === 'lead',
      is_team_manager: this.formData.role === 'manager',
      team_managers_id: this.formData.team_manager_id ? [this.formData.team_manager_id] : [],

    };
  }


  // 🔹 Fetch Departments from API
  loadDepartments() {
    this.superadmin.getDepartments().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.departments = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
        this.toastr.error('Failed to load departments');
      },
    });
  }

  // 🔹 Fetch Designations from API
  loadDesignations() {
    this.superadmin.getDesignations().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.designations = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching designations:', err);
        this.toastr.error('Failed to load designations');
      },
    });
  }

  // 🔹 Fetch Sub-Designations from API
  loadSubDesignations() {
    this.superadmin.getSubdesignations().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.sub_designations = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching sub-designations:', err);
        this.toastr.error('Failed to load sub-designations');
      },
    });

  }

  // 🔹 Fetch Team Leads from API
  // 🔹 Fetch Team Leads from API
  loadTeamLeads() {
    this.superadmin.getTeamLeads().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.teamLeads = res.data; // ✅ response is wrapped
        }
      },
      error: (err) => {
        console.error('Error fetching team leads:', err);
        this.toastr.error('Failed to load team leads');
      },
    });
  }

  // 🔹 Fetch Team Managers from API
  loadTeamManagers() {
    this.superadmin.getTeamManagers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.teamManagers = res.data; // ✅ use res.data, not res
          console.log('Team Managers:', this.teamManagers);
        }
      },
      error: (err) => {
        console.error('Error loading team managers:', err);
        this.toastr.error('Failed to load team managers');
      },
    });
  }
  loadRoles() {
    this.superadmin.getRoles().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.roles = res.data; // ✅ API usually wraps in .data
          console.log("Roles loaded:", this.roles);
        }
      },
      error: (err) => {
        console.error("Error fetching roles:", err);
        this.toastr.error("Failed to load roles");
      }
    });
  }

  onFileChange(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[fieldName] = file;
    }
  }

  onDocumentUpload(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.docs[index].file = file;
      this.docs[index].file_name = file.name;
      this.docs[index].path = URL.createObjectURL(file); // 👈 Local preview URL
    }
  }

  // For anchor [href]
  getPreviewUrl(doc: DocumentItem): string {
    if (doc.file) {
      return URL.createObjectURL(doc.file); // local file preview
    }
    return doc.path || "#"; // fallback to uploaded path if available
  }

  // To reset a selected file before saving
  removeSelectedFile(index: number) {
    this.docs[index].file = undefined;
    this.docs[index].file_name = undefined;
    this.docs[index].path = undefined;
  }

  onSave() {
    this.syncQualificationData();

    // Separate files from text fields
    const files: { [key: string]: File } = {};
    Object.keys(this.uploadedFiles).forEach((key) => {
      files[key] = this.uploadedFiles[key];
    });

    // Pass formData + files

    // Add text fields from your form payload
    const payload = this.prepareFormData();


    // Add files from docs
    this.docs.forEach(doc => {
      if (doc.file) {
        files[doc.key] = doc.file;
      }

    });

    console.log("files ---> ", files)
    this.superadmin.addNewEmployee(payload, files).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success('Employee created successfully!');
          this.router.navigate(['/main/update-employee/', res._id]);
        } else {
          this.toastr.error(res.message || 'Something went wrong');
        }
      },

      error: (err) => {
        console.log("error ---> ", err);
        this.toastr.error(err.error.message || 'Something went wrong');
      },
    });
  }


  viewPermissions() {
    if (!this.formData.role_id) {
      this.toastr.warning("Please select a role first");
      return;
    }

    this.superadmin.getRoleById(this.formData.role_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const role = res.data;
          console.log("Role permissions:", role.permissions);

          // ✅ Update UI permissions dynamically
          this.permissions.forEach((p) => {
            const found = role.permissions.find((rp: any) => rp.name === p.name);
            if (found) {
              p.read = found.read;
              p.write = found.write;
              p.create = found.create;
            }
          });

          // Show modal with permissions
          this.openAddRoleModal();
        }
      },
      error: (err) => {
        console.error("Error fetching role permissions:", err);
        this.toastr.error("Failed to fetch role permissions");
      },
    });
  }


  // Permissions for roles
  roleList: any[] = [];       // Small cards (summary view)
  fullRoleList: any[] = [];   // Detailed list with permissions
  permissions: any[] = [];



  isEditing = false;
  modalTitle = 'Add Role';

  // ✅ Role object for Add/Edit
  currentRole: any = {
    _id: '',
    role_name: '',
    description: '',
    is_active: true,
    status: '1',
    permissions: [] as any[]
  };


  openAddRoleModal() {
    this.modalTitle = 'Add Role';
    this.isEditing = false;
    this.currentRole = { name: '', status: '', permissions: [] };

    // Reset permissions
    this.permissions.forEach((p) => {
      p.read = false;
      p.write = false;
      p.create = false;
    });
  }

  closeAddTaskPopup(): void {
    this.currentRole = { name: '', status: '', permissions: [] };
  }

  // ✅ Fetch menus for permissions
  loadMenu() {
    this.superadmin.getMenus().subscribe({
      next: (res) => {
        if (res.success) {
          this.permissions = res.data.map((m: any) => ({
            _id: m._id,
            name: m.name,
            key: m.key,
            read: false,
            write: false,
            create: false
          }));
        }
      },
      error: (err) => console.error('Error loading menus:', err)
    });
  }



  // ✅ Open Edit Role Modal (fetch details by ID)
  openEditRoleModal() {

    this.modalTitle = 'View Role';

    // // Reset checkboxes
    // this.permissions.forEach(p => {
    //   p.read = false;
    //   p.write = false;
    //   p.create = false;
    // });

    this.loadMenu();
    console.log("this.formData.role_id ---> ", this.formData.role_id);
    // Fetch full details of this role
    this.superadmin.getRoleById(this.formData.role_id).subscribe({
      next: (res: any) => {
        console.log("res---> ", res);
        if (res.success) {
          const r = res.data;

          // Fill currentRole
          this.currentRole = {
            _id: r._id,
            role_name: r.role_name,
            description: r.description,
            // is_active: r.is_active ? 'Active' : 'Inactive',
            status: r.is_active ? 'Active' : 'Inactive',
            permissions: r.permissions || []
          };

          // console.log("this.currentRole---> ", this.currentRole);
          // console.log("this.currentRole ---> ", this.currentRole)

          // Pre-fill permission checkboxes
          (r.permissions || []).forEach((m: any) => {
            const match = this.permissions.find(p => p._id === (m.menu?._id || m.menu));
            if (match) {
              match.read = m.actions.includes('read');
              match.write = m.actions.includes('write');
              match.create = m.actions.includes('create');
            }
          });
        }
      },
      error: (err) => console.error('Error fetching role by ID:', err)
    });
  }

  // Component
  syncAddress() {
    if (this.formData.is_current_add_same_as_permanent) {
      this.formData.permanent_address = this.formData.current_address;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

}
