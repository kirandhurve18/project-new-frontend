import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Superadmin } from '../../../../core/services/superadmin';
import { EmployeeService } from '../../../../services/employee.service';
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

interface DocumentFile {
  _id: string;
  file: File;
  path?: string;
  name?: string;
}

interface DocumentItem {
  name: string;
  key: string;
  files: DocumentFile[];
  url?: string;
  uploaded?: boolean;
  _id?: string;
}


@Component({
  selector: 'app-profile-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-employee.component.html',
  styleUrls: ['./profile-employee.component.css'],
})
export class ProfileEmployeeComponent implements OnInit {
  userRole: string | null = null;
  isUpdateMode: boolean = true;
  employeeId!: string;
  BASE_URL_IMAGE: string = '';
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;
  showPassword: boolean = false

  /** ================================
   * DATA SOURCES
   ================================ */
  // docs: string[] = [
  //   'Aadhar Card', 'PAN Card', 'Passport Size Photo', 'Employee Email Signature',
  //   '10th Certificate', '12th Certificate', 'Graduation Certificate', 'Resume',
  //   'Previous Offer Letter', 'Previous Experience Letter'
  // ];

  docs: DocumentItem[] = [
    { files: [], name: 'Aadhar Card', key: 'aadhar_card' },
    { files: [], name: 'PAN Card', key: 'pan_card' },
    { files: [], name: 'Passport Size Photo', key: 'passport_photo' },
    { files: [], name: 'Employee Email Signature', key: 'employee_sign' },
    { files: [], name: '10th Certificate', key: 'tenth_certificate' },
    { files: [], name: '12th Certificate', key: 'twelfth_certificate' },
    { files: [], name: 'Graduation Certificate', key: 'graduation_certificate' },
    { files: [], name: 'Resume', key: 'resume' },
    { files: [], name: 'Previous Offer Letter', key: 'previous_offer_letter' },
    { files: [], name: 'Previous Experience Letter', key: 'previous_experience_letter' },
    { files: [], name: 'Form16', key: 'form_16' },
  ];



  employment_type: string[] = ['FULLTIME', 'CONTRACT', 'INTERNSHIP'];
  departments: any[] = [];
  designations: Designation[] = [];
  sub_designations: SubDesignation[] = [];
  teamLeads: any[] = [];
  teamManagers: any[] = [];
  roles: any[] = [];
  bloodGroups: string[] = ['A+', 'B+', 'A-', 'B-', 'AB+', 'AB-', 'O-', 'O+'];
  qualifications: string[] = ['tenth', 'twelfth', 'graduation', 'post graduation'];
  uploadedFiles: { [key: string]: File } = {};


  backgroundVerification = [
    { designation: 'HR', name: '', email: '', number: '' },
    { designation: 'Team Lead/Manager', name: '', email: '', number: '' },
    { designation: 'Manager', name: '', email: '', number: '' },
    { designation: 'Company', name: '', email: '', number: '' }
  ];


  /** ================================
   * FORM DATA
   ================================ */
  formData: any = {
    employee_id: '',
    role_id: '',
    team_lead_id: null,
    team_managers_id: [],
    team_manager_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    company_email: '',
    password: '',
    personal_email: '',
    designation_id: '',
    sub_designation_id: '',
    is_team_lead: false,
    is_team_manager: false,
    department_id: '',
    employment_type: '',
    employee_number: '',
    alternate_number: '',
    emergency_number: '',
    family_member_relation: '',
    current_address: '',
    is_current_add_same_as_permanent: false,
    permanent_address: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    work_mode: '',
    date_of_joining: '',
    notice_period: '',
    work_experience: '',
    salary: '',
    bank_name: '',
    bank_account_number: '',
    ifsc_code: '',
    is_active: true,
    tenth_passing_year: '',
    tenth_percentage: '',
    twelfth_passing_year: '',
    twelfth_percentage: '',
    graduation_passing_year: '',
    graduation_percentage: '',
    post_graduation_passing_year: '',
    post_graduation_percentage: '',
    aadhar_card_number: '',
    pan_card_number: '',
    pf_account_number: '',
    uan_number: '',
    esi_number: '',
    assigned_menus: [],
    probation_period_ends_on: '',
    background_verification: [
      { designation: 'HR', name: '', email: '', number: '' },
      { designation: 'Team Lead/Manager', name: '', email: '', number: '' },
      { designation: 'Manager', name: '', email: '', number: '' },
      { designation: 'Company', name: '', email: '', number: '' }
    ]

  };

  qualificationMap: any = {
    'tenth': { year: '', percentage: '' },
    'twelfth': { year: '', percentage: '' },
    'graduation': { year: '', percentage: '' },
    'post graduation': { year: '', percentage: '' },
  };

  /** ================================
   * ROLE PERMISSIONS
   ================================ */
  roleList: any[] = [];       // Small cards (summary view)
  fullRoleList: any[] = [];   // Detailed list with permissions
  permissions: any[] = [];

  modalTitle = 'View Permissions';
  is_roleOpend: boolean = false;

  // ✅ Role object for Add/Edit
  currentRole: any = {
    _id: '',
    role_name: '',
    description: '',
    is_active: true,
    status: '1',
    permissions: [] as any[]
  };

  constructor(
    private router: Router,
    private superadmin: Superadmin,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role');
    const user = localStorage.getItem('user');

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.BASE_URL_IMAGE = environment.BASE_URL_IMAGE || '';
    // Load dropdowns
    this.loadDepartments();
    this.loadDesignations();
    this.loadSubDesignations();
    this.loadTeamLeads();
    this.loadTeamManagers();
    this.loadRoles();

    // Check for update mode
    this.employeeId = this.route.snapshot.paramMap.get('id')!;
    if (this.employeeId) {
      this.getEmployeeDetails(this.employeeId);
    }
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


  mapDocuments(apiDocs: any[]): void {
    // reset first
    this.docs.forEach(d => d.files = []);
    this.docs.forEach(d => d._id = '');

    apiDocs.forEach(apiDoc => {
      const targetDoc = this.docs.find(d => d.key === apiDoc.document_type);
      if (targetDoc) {
        targetDoc._id = apiDoc._id;
        targetDoc.files = apiDoc.files.map((f: any) => ({
          _id: f._id,
          path: f.path
        }));
      }
    });
  }

  /** ================================
   * EMPLOYEE DETAILS
   ================================ */
  getEmployeeDetails(id: string): void {
    this.superadmin.getEmployeeById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.formData = { ...this.formData, ...res.data };

          this.formData.is_current_add_same_as_permanent = this.formData.current_address == this.formData.permanent_address;


          if (res.data?.team_managers_id?.length) this.formData.team_manager_id = res.data.team_managers_id[0];

          if (this.formData.is_team_lead) this.formData.role = 'lead';
          else if (this.formData.is_team_manager) this.formData.role = 'manager';
          else if (this.formData.is_super_admin) this.formData.role = 'admin';
          else this.formData.role = 'employee'

          // After fetching API
          if (!this.formData.background_verification || !Array.isArray(this.formData.background_verification)) {
            this.formData.background_verification = [
              { designation: 'hr', name: '', email: '', number: '' },
              { designation: 'lead', name: '', email: '', number: '' },
              { designation: 'manager', name: '', email: '', number: '' },
              { designation: 'company', name: '', email: '', number: '' }
            ];
          } else {
            const defaultRows = [
              { designation: 'hr', name: '', email: '', number: '' },
              { designation: 'lead', name: '', email: '', number: '' },
              { designation: 'manager', name: '', email: '', number: '' },
              { designation: 'company', name: '', email: '', number: '' }
            ];

            this.formData.background_verification = defaultRows.map((row, index) => {
              const apiRow = this.formData.background_verification[index] || {};
              return {
                designation: row.designation,
                name: apiRow.name || '',
                email: apiRow.email || '',
                number: apiRow.number || ''
              };
            });
          }

          // Initialize selection when loading data
          this.teamManagers.forEach(manager => {
            manager.selected = this.formData.team_managers_id.includes(manager._id);
          });

          let documents = res.data.documents;

          this.mapDocuments(documents);
          // console.log("mappedDocs --->", mappedDocs);
          this.patchQualificationMap();
        }
      },
      error: (err) => {
        console.error('Error fetching employee:', err);
        this.toastr.error('Failed to load employee details');
      }
    });
  }

  /** ================================
   * QUALIFICATION SYNC
   ================================ */
  syncQualificationData() {
    for (const q of this.qualifications) {
      console.log("q --> ", q);
      const key = q.toLowerCase().replace(' ', '_');
      console.log("key --> ", key);
      this.formData[`${key}_passing_year`] = this.qualificationMap[q].year;
      this.formData[`${key}_percentage`] = this.qualificationMap[q].percentage;
    }
  }

  patchQualificationMap() {
    for (const q of this.qualifications) {
      console.log("q --> ", q);
      const key = q.toLowerCase().replace(' ', '_');
      console.log("key --> ", key);

      this.qualificationMap[q].year = this.formData[`${key}_passing_year`] || '';
      this.qualificationMap[q].percentage = this.formData[`${key}_percentage`] || '';
    }
  }

  /** ================================
   * FILE HANDLING
   ================================ */
  onFileChange(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) this.uploadedFiles[fieldName] = file;
  }



  prepareFormData() {
    return {
      ...this.formData,
      is_team_lead: this.formData.role === 'lead',
      is_team_manager: this.formData.role === 'manager',
      team_managers_id: this.formData.team_manager_id ? [this.formData.team_manager_id] : [],
    };
  }

  /** ================================
   * SAVE HANDLER
   ================================ */
  onUpdate() {
    this.syncQualificationData();

    const payload = this.prepareFormData();

    if (this.isUpdateMode && this.employeeId) {
      this.superadmin.updateEmployeeById(this.employeeId, payload).subscribe({
        next: () => {
          this.toastr.success('Employee updated successfully!');
          // this.router.navigate(['/main/employee_info']);
        },
        error: (err) =>
          this.toastr.error(err.error?.message || 'Failed to update employee'),
      });
    } else {
      this.superadmin.addNewEmployee(this.formData, this.uploadedFiles).subscribe({
        next: () => {
          this.toastr.success('Employee created successfully!');
          // this.router.navigate(['/main/employee_info']);
        },
        error: (err) =>
          this.toastr.error(err.error?.message || 'Failed to create employee'),
      });
    }
  }

  /** ================================
   * DROPDOWN LOADERS
   ================================ */
  loadDepartments() {
    this.superadmin.getDepartments().subscribe({
      next: (res: any) => { if (res.success) this.departments = res.data; },
      error: () => this.toastr.error('Failed to load departments')
    });
  }

  loadDesignations() {
    this.superadmin.getDesignations().subscribe({
      next: (res: any) => { if (res.success) this.designations = res.data; },
      error: () => this.toastr.error('Failed to load designations')
    });
  }

  loadSubDesignations() {
    this.superadmin.getSubdesignations().subscribe({
      next: (res: any) => { if (res.success) this.sub_designations = res.data; },
      error: () => this.toastr.error('Failed to load sub-designations')
    });
  }

  loadTeamLeads() {
    this.superadmin.getTeamLeads().subscribe({
      next: (res: any) => { if (res.success) this.teamLeads = res.data; },
      error: () => this.toastr.error('Failed to load team leads')
    });
  }

  loadTeamManagers() {
    this.superadmin.getTeamManagers().subscribe({
      next: (res: any) => { if (res.success) this.teamManagers = res.data; },
      error: () => this.toastr.error('Failed to load team managers')
    });
  }

  loadRoles() {
    this.superadmin.getRoles().subscribe({
      next: (res: any) => { if (res.success) this.roles = res.data; },
      error: () => this.toastr.error('Failed to load roles')
    });
  }

  /** ================================
   * ROLE PERMISSIONS HANDLER
   ================================ */
  viewPermissions() {
    if (!this.formData.role_id) {
      this.toastr.warning('Please select a role first');
      return;
    }

    this.superadmin.getRoleById(this.formData.role_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const role = res.data;
          this.permissions.forEach((p) => {
            const found = role.permissions.find((rp: any) => rp.name === p.name);
            if (found) {
              p.read = found.read;
              p.write = found.write;
              p.create = found.create;
            }
          });
          this.openAddRoleModal();
        }
      },
      error: () => this.toastr.error('Failed to fetch role permissions')
    });
  }

  // ✅ Open Edit Role Modal (fetch details by ID)
  openEditRoleModal() {
    this.is_roleOpend = true;
    this.modalTitle = 'View Role';

    // Reset checkboxes
    this.permissions.forEach(p => {
      p.read = false;
      p.write = false;
      p.create = false;
    });

    this.loadMenu();
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

          console.log("this.currentRole---> ", this.currentRole);
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

  openAddRoleModal() {
    this.currentRole = { name: '', status: '', permissions: [] };
    this.permissions.forEach((p) => (p.read = p.write = p.create = false));
  }

  closeAddTaskPopup(): void {
    this.currentRole = { name: '', status: '', permissions: [] };
  }


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Return selected managers
  getSelectedManagers(): any[] {
    return this.teamManagers.filter(m => m.selected);
  }

  // Remove a manager from selection
  removeManager(manager: any, event: Event) {
    event.stopPropagation(); // prevent dropdown toggle
    manager.selected = false;
    this.onManagerSelect(manager);
  }

  // Bind selected managers to formData
  onManagerSelect(manager: any) {
    const selectedIds = this.teamManagers
      .filter(m => m.selected)
      .map(m => m._id);
    this.formData.team_managers_id = selectedIds;
  }

  // Component
  syncAddress() {
    if (this.formData.is_current_add_same_as_permanent) {
      this.formData.permanent_address = this.formData.current_address;
    }
  }


  /** ================================
   * DOCUMENT HANDLING
   ================================ */
  onDocumentUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // this.docs[index].file = file;
      this.uploadDocument(event, index);
    }
  }

  uploadDocument(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;

    const doc = this.docs[index];

    console.log("file", file)
    // Wrap into DocumentFile
    const newFile: DocumentFile = {
      _id: Date.now().toString(), // temp id until backend assigns real _id
      file,
      path: undefined,
      name: file.name,
    };

    // Reset or add the file (assuming only one file per doc)
    doc.files = [newFile];

    // Build FormData
    const formDataFile = new FormData();
    formDataFile.append("_id", this.employeeId);
    // formDataFile.append("key", doc.key); // which doc type (aadhar, pan, etc.)
    formDataFile.append(doc.key, file, file.name);

    this.employeeService.uploadDocument(formDataFile).subscribe({
      next: (res) => {

        if (res && res.success) {

          doc.uploaded = res.success;
          doc.url = res.url || "";
          if (res.fileId) {
            // update _id if backend returns one
            doc.files[0]._id = res.fileId;
          }
          this.toastr.success(`${doc.name} uploaded successfully`);
        } else {
          this.toastr.error(`${doc.name} uploading failed...`);

        }
      },
      error: () => {
        doc.uploaded = false;
        this.toastr.error(`Failed to upload ${doc.name}`);
      },
    });
  }

  removeDocument(index: number) {
    // this.docs[index].file = undefined;
    // this.docs[index].url = '';
    // this.docs[index].uploaded = false;
  }

  // Open document in new tab
  viewDocument(doc: any) {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  }


  getFileUrl(path: string): string {
    return `${this.BASE_URL_IMAGE}/hrms/dashboard/server_preview_file?key=${path}`; // replace with env

  }

  removeUploadedDocument(path: string | null, _id: string, key: string) {
    let payload = {
      document_id: _id,
      file_path: path,
    };

    console.log("payload --> ", payload);
    this.employeeService.documentStatusUpdate(payload).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.toastr.success(res.message);

          // ✅ Remove the deleted file from local state
          this.docs = this.docs.map(doc => {
            if (doc.key === key) {
              return {
                ...doc,
                files: doc.files.filter(file => file.path !== path),
              };
            }
            return doc;
          });

        } else {
          this.toastr.error(res.message);
        }
      },
      error: () => {
        this.toastr.error(`File Delete Failed`);
      },
    });
  }

}
