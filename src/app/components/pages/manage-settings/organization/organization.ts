import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization.html',
  styleUrls: ['./organization.css'],
})
export class OrganizationComponent implements OnInit {

  departments: any[] = [];
  designations: any[] = [];
  subdesignations: any[] = [];
  delete_solid_icon = `${environment.BASE_PATH_ASSETS}/icons/delete_solid_icon.svg`;

  showAddPopup = false;
  isEditing = false;
  editingType: 'department' | 'designation' | 'subdesignation' | '' = '';
  editingIndex: number | null = null;

  newItemTitle = '';
  newItemStatus: 'active' | 'inactive' = 'active';
  selectedDepartmentId: string | null = null;
  selectedDesignationId: string | null = null;


  toasts: { message: string; type: 'success' | 'error' | 'warning' }[] = [];

  constructor(private superadminService: Superadmin) { }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDesignations();
    this.loadSubdesignations();
  }

  //load department
  loadDepartments(): void {
    this.superadminService.getDepartments().subscribe({
      next: (res: any) => {
        this.departments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      },
      error: () => this.showToast('Failed to load departments', 'error'),
    });
  }

  //load designation
  loadDesignations(): void {
    this.superadminService.getDesignations().subscribe({
      next: (res: any) => {
        this.designations = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      },
      error: () => this.showToast('Failed to load designations', 'error'),
    });
  }

  //load subdesignation
  loadSubdesignations(): void {
    this.superadminService.getSubdesignations().subscribe({
      next: (res: any) => {
        this.subdesignations = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      },
      error: () => this.showToast('Failed to load subdesignations', 'error'),
    });
  }


  openAddPopup(type: 'department' | 'designation' | 'subdesignation'): void {
    this.showAddPopup = true;
    this.isEditing = false;
    this.editingType = type;
    this.editingIndex = null;
    this.newItemTitle = '';
    this.newItemStatus = 'active';
    this.selectedDepartmentId = null;
    this.selectedDesignationId = null;
  }

  openEditPopup(type: 'department' | 'designation' | 'subdesignation', index: number): void {
    this.showAddPopup = true;
    this.isEditing = true;
    this.editingType = type;
    this.editingIndex = index;

    if (type === 'department') {
      const dept = this.departments[index];
      console.log("dept ---> ", dept)
      this.newItemTitle = dept?.department_name || dept?.dept_name || '';
      this.newItemStatus = dept?.status === 1
          ? 'active'
          : 'inactive';
    } else if (type === 'designation') {
      const desg = this.designations[index];
      console.log("desg --> ", desg);
      this.newItemTitle = desg?.designation_name;
      this.selectedDepartmentId = desg?.departmentId || null; // ✅ Preselect department
      this.newItemStatus = desg.status === 1
        ? 'active'
        : 'inactive';
    } else if (type === 'subdesignation') {
      const sub = this.subdesignations[index];
      this.newItemTitle = sub?.sub_designation_name || sub?.subdesignation_name || '';

      this.newItemStatus =
        (sub?.status + '').toLowerCase() === 'active' || sub?.status === true
          ? 'active'
          : 'inactive';
    }
  }

  closeAddPopup(): void {
    this.showAddPopup = false;
  }


  submitItem(): void {
    if (!this.newItemTitle.trim()) {
      this.showToast('Title is required', 'warning');
      return;
    }

    if (this.editingType === 'designation' && !this.selectedDepartmentId) {
      this.showToast('Please select a department', 'warning');
      return;
    }

    if (this.isEditing) {
      this.updateItem();
    } else {
      this.addItem();
    }
  }


  addItem(): void {
    if (this.editingType === 'department') {
      const payload = {
        department_name: this.newItemTitle,
        status: this.newItemStatus,
      };
      this.superadminService.addDepartment(payload).subscribe({
        next: () => {
          this.showToast('Department added successfully!', 'success');
          this.loadDepartments();
          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to add department', 'error'),
      });
    } else if (this.editingType === 'designation') {
      const payload = {
        designation_name: this.newItemTitle,
        department_id: this.selectedDepartmentId,
        status: this.newItemStatus == 'active'? 1 : 0,
      };
      this.superadminService.addDesignation(payload).subscribe({
        next: () => {
          this.showToast('Designation added successfully!', 'success');
          this.loadDesignations();
          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to add designation', 'error'),
      });
    } else if (this.editingType === 'subdesignation') {
      const payload = {
        sub_designation_name: this.newItemTitle,
        status: this.newItemStatus,
      };
      this.superadminService.addSubdesignation(payload).subscribe({
        next: () => {
          this.showToast('Subdesignation added successfully!', 'success');
          this.loadSubdesignations();
          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to add subdesignation', 'error'),
      });
    }
  }


  updateItem(): void {
    if (this.editingIndex === null) return;

    if (this.editingType === 'department') {
      const dept = this.departments[this.editingIndex];
      console.log("dept id ", dept)
      console.log("this.newItem ---> ", this.newItemStatus);
      const payload = {
        department_id: dept._id,
        department_name: this.newItemTitle,
        status: this.newItemStatus == 'active' ? 1 : 0,
      };
      this.superadminService.updateDepartment(payload).subscribe({
        next: () => {
          this.showToast('Department updated successfully!', 'success');
          this.loadDepartments();
          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to update department', 'error'),
      });
    } else if (this.editingType === 'designation') {
      const desg = this.designations[this.editingIndex];
      console.log("desg ---> ", desg)
      console.log("this.newItemStatus ---> ", this.newItemStatus)
      const payload = {
        designation_id: desg._id,
        designation_name: this.newItemTitle,
        department_id: this.selectedDepartmentId,
        status: this.newItemStatus == 'active' ? 1 : 0,
      };
      this.superadminService.updateDesignation(payload).subscribe({
        next: () => {
          this.showToast('Designation updated successfully!', 'success');
          this.loadDesignations();
          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to update designation', 'error'),
      });
    }
    else if (this.editingType === 'subdesignation') {
      const sub = this.subdesignations[this.editingIndex];

      const payload = {
        sub_designation_id: sub?._id || sub?.subdesg_id || sub?.id,
        sub_designation_name: this.newItemTitle,
        status: this.newItemStatus,
      };

      this.superadminService.updateSubdesignation(payload).subscribe({
        next: () => {
          this.showToast('Subdesignation updated successfully!', 'success');
          this.loadSubdesignations();


          this.loadDepartments();
          this.loadDesignations();

          this.closeAddPopup();
        },
        error: () => this.showToast('Failed to update subdesignation', 'error'),
      });
    }

  }


  deleteItem(type: 'department' | 'designation' | 'subdesignation', index: number): void {
    if (type === 'department') {
      const dept = this.departments[index];
      const id = dept?._id || dept?.dept_id || dept?.id;
      if (!id) return;

      this.superadminService.deleteDepartment(id).subscribe({
        next: () => {
          this.showToast('Department deleted successfully!', 'success');
          this.loadDepartments();
        },
        error: () => this.showToast('Failed to delete department', 'error'),
      });
    } else if (type === 'designation') {
      const desg = this.designations[index];
      const id = desg?._id || desg?.desg_id || desg?.id;
      if (!id) return;

      this.superadminService.deleteDesignation(id).subscribe({
        next: () => {
          this.showToast('Designation deleted successfully!', 'success');
          this.loadDesignations();
        },
        error: () => this.showToast('Failed to delete designation', 'error'),
      });
    } else if (type === 'subdesignation') {
      const sub = this.subdesignations[index];
      const id = sub?._id || sub?.subdesg_id || sub?.id;
      if (!id) return;

      this.superadminService.deleteSubdesignation(id).subscribe({
        next: () => {
          this.showToast('Subdesignation deleted successfully!', 'success');
          this.loadSubdesignations();
        },
        error: () => this.showToast('Failed to delete subdesignation', 'error'),
      });
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    const toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => this.removeToast(toast), 3000);
  }

  removeToast(toast: { message: string; type: 'success' | 'error' | 'warning' }): void {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
