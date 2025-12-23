import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll.html',
  styleUrls: ['./payroll.css']
})
export class PayrollComponent {
  incomeComponents = [
    { name: 'Basic Salary', status: 'Active' },
    { name: 'House Rent Allowance (HRA)', status: 'Active' },
    { name: 'Conveyance & Medical Allowance', status: 'Active' },
    { name: 'Bonus', status: 'Active' },
    { name: 'Other Allowance', status: 'Inactive' }
  ];

  deductionComponents = [
    { name: 'Provident Fund', status: 'Active' },
    { name: 'Profession Tax', status: 'Active' },
    { name: 'TDS', status: 'Active' },
    { name: 'Admin Charges', status: 'Active' },
    { name: 'ESIC', status: 'Inactive' }
  ];

  // Popup control
  newItemTitle = '';
  newItemStatus = 'Active';
  isEditing = false;
  editingIndex = -1;
  showAddPopup = false;
  editingType: 'income' | 'deduction' = 'income';

  /** Open popup for adding new item */
  openAddPopup(type: 'income' | 'deduction'): void {
    this.resetForm();
    this.editingType = type;
    this.showAddPopup = true;
  }

  /** Open popup in edit mode */
  openEditPopup(type: 'income' | 'deduction', index: number): void {
    this.editingType = type;
    this.editingIndex = index;
    this.isEditing = true;
    const item = type === 'income' ? this.incomeComponents[index] : this.deductionComponents[index];
    this.newItemTitle = item.name;
    this.newItemStatus = item.status;
    this.showAddPopup = true;
  }

  /** Close and reset popup */
  closeAddPopup(): void {
    this.resetForm();
    this.showAddPopup = false;
  }

  /** Reset form state */
  private resetForm(): void {
    this.newItemTitle = '';
    this.newItemStatus = 'Active';
    this.isEditing = false;
    this.editingIndex = -1;
  }

  /** Submit form for add or update */
  submitItem(): void {
    const title = this.newItemTitle.trim();
    const status = this.newItemStatus;
    if (!title) return;

    if (this.editingType === 'income') {
      if (this.isEditing && this.editingIndex !== -1) {
        this.incomeComponents[this.editingIndex] = { name: title, status };
      } else {
        this.incomeComponents.push({ name: title, status });
      }
    } else {
      if (this.isEditing && this.editingIndex !== -1) {
        this.deductionComponents[this.editingIndex] = { name: title, status };
      } else {
        this.deductionComponents.push({ name: title, status });
      }
    }

    this.closeAddPopup();
  }

  /** Toggle status (Active/Inactive) */
  toggleStatus(type: 'income' | 'deduction', index: number): void {
    if (type === 'income') {
      
      const current = this.incomeComponents[index];
      current.status = current.status === 'Active' ? 'Inactive' : 'Active';
    } else {
      const current = this.deductionComponents[index];
      current.status = current.status === 'Active' ? 'Inactive' : 'Active';
    }
  }

  /** Delete item */
  deleteItem(type: 'income' | 'deduction', index: number): void {
    if (type === 'income') {
      this.incomeComponents.splice(index, 1);
    } else {
      this.deductionComponents.splice(index, 1);
    }
  }
}
