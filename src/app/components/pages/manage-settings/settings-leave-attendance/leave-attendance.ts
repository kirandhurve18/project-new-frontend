import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';

type ItemType = 'Period' | 'weekoff' | 'shift';


interface LeaveItem {
  id?: string;
  title: string;
  duration: string;
}

interface WeekoffItem {
  id?: string;
  work_mode: string;
  days: string;
}

interface ShiftItem {
  id?: string;
  title: string;
  timings: string;
}

@Component({
  selector: 'app-leave-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-attendance.html',
  styleUrls: ['./leave-attendance.css'],
})
export class LeaveAttendance implements OnInit {
  LeaveAttendance: LeaveItem[] = [];
  weekoff: WeekoffItem[] = [];
  shifts: ShiftItem[] = [];

  isEditing = false;  
  editingIndex = -1;
  editingType: ItemType = 'Period';
  showAddPopup = false;

  newItemTitle = '';
  newItemExtra = '';
  newWorkMode = '';
  newDays = '';

  constructor(private superadmin: Superadmin) {}

  ngOnInit(): void {
    this.loadLeaveServices();
    this.loadWeekOffSetup();
    this.loadShifts();
  }

  
loadLeaveServices() {
this.superadmin.getLeaveServices().subscribe({
  next: (res: any) => {
    console.log('API Full Response:', res);

    const services = res.data?.leave_services || res.data || res; 
    this.LeaveAttendance = services.map((item: any) => ({
      id: item._id,
      title: item.title,
      duration: item.duration,
    }));
  }
});

}

  loadWeekOffSetup() {
    this.superadmin.getWeekOff().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.weekoff = res.data.map((item: any) => ({
            id: item._id,
            work_mode: item.work_mode,
            days: item.days,
          }));
        }
      },
      error: (err) => console.error('Error loading weekoff:', err),
    });
  }

 
  loadShifts() {
    this.superadmin.getShifts().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.shifts = res.data.map((item: any) => ({
            id: item._id,
            title: item.title,
            timings: item.timings,
          }));
        }
      },
      error: (err) => console.error('Error loading shifts:', err),
    });
  }

  openAddPopup(type: ItemType) {
    this.resetForm();
    this.editingType = type;
    this.showAddPopup = true;
  }

  openEditPopup(type: ItemType, index: number) {
    this.resetForm();
    this.editingType = type;
    this.editingIndex = index;
    this.isEditing = true;
    this.showAddPopup = true;

    if (type === 'Period') {
      const item = this.LeaveAttendance[index];
      this.newItemTitle = item.title;
      this.newItemExtra = item.duration;
    } else if (type === 'weekoff') {
      const item = this.weekoff[index];
      this.newWorkMode = item.work_mode;
      this.newDays = item.days;
    } else if (type === 'shift') {
      const item = this.shifts[index];
      this.newItemTitle = item.title;
      this.newItemExtra = item.timings;
    }
  }

  /** 🔹 Close Popup */
  closeAddPopup() {
    this.resetForm();
    this.showAddPopup = false;
  }

  /** 🔹 Submit (Add or Update) */
  submitItem() {
    if (this.editingType === 'Period') {
      const title = this.newItemTitle.trim();
      const duration = this.newItemExtra.trim();
      if (!title || !duration) return;

      if (this.isEditing && this.editingIndex >= 0) {
        const currentItem = this.LeaveAttendance[this.editingIndex];
        const payload = { id: currentItem.id!, title, duration };

        this.superadmin.updateLeaveOrService(payload).subscribe({
          next: () => {
            this.loadLeaveServices();
            this.closeAddPopup();
          },
          error: (err) => console.error('Period Update Error:', err),
        });
      } else {
        const payload = {leave_services : [ {title: title, duration: duration} ] };
        this.superadmin.addLeaveOrService(payload).subscribe({
          next: () => {
            this.loadLeaveServices();
            this.closeAddPopup();
          },
          error: (err) => console.error('Period Add Error:', err),
        });
      }
    }

    else if (this.editingType === 'weekoff') {
      const work_mode = this.newWorkMode.trim();
      const days = this.newDays.trim();
      if (!work_mode || !days) return;

      if (this.isEditing && this.editingIndex >= 0) {
        const currentItem = this.weekoff[this.editingIndex];
        const payload = { id: currentItem.id!, work_mode, days };

        this.superadmin.updateWeekOff(payload).subscribe({
          next: () => {
            this.loadWeekOffSetup();
            this.closeAddPopup();
          },
          error: (err) => console.error('Weekoff Update Error:', err),
        });
      } else {
        const payload = { work_mode, days };
        this.superadmin.addWeekOff(payload).subscribe({
          next: () => {
            this.loadWeekOffSetup();
            this.closeAddPopup();
          },
          error: (err) => console.error('Weekoff Add Error:', err),
        });
      }
    }

    else if (this.editingType === 'shift') {
      const title = this.newItemTitle.trim();
      const timings = this.newItemExtra.trim();
      if (!title || !timings) return;

      if (this.isEditing && this.editingIndex >= 0) {
        const currentItem = this.shifts[this.editingIndex];
        const payload = { id: currentItem.id!, title, timings };

        this.superadmin.updateShift(payload).subscribe({
          next: () => {
            this.loadShifts();
            this.closeAddPopup();
          },
          error: (err) => console.error('Shift Update Error:', err),
        });
      } else {
        const payload = { title, timings };
        this.superadmin.addShift(payload).subscribe({
          next: () => {
            this.loadShifts();
            this.closeAddPopup();
          },
          error: (err) => console.error('Shift Add Error:', err),
        });
      }
    }
  }

  /** 🔹 Delete */
  deleteItem(type: ItemType, index: number) {
    if (type === 'Period') {
      const item = this.LeaveAttendance[index];
      if (!item.id) return;

      this.superadmin.deleteLeaveOrService(item.id).subscribe({
        next: () => this.loadLeaveServices(),
        error: (err) => console.error('Delete Period Error:', err),
      });
    }

    else if (type === 'weekoff') {
      const item = this.weekoff[index];
      if (!item.id) return;

      this.superadmin.deleteWeekOff(item.id).subscribe({
        next: () => this.loadWeekOffSetup(),
        error: (err) => console.error('Delete Weekoff Error:', err),
      });
    }

    else if (type === 'shift') {
      const item = this.shifts[index];
      if (!item.id) return;

      this.superadmin.deleteShift(item.id).subscribe({
        next: () => this.loadShifts(),
        error: (err) => console.error('Delete Shift Error:', err),
      });
    }
  }

  /** 🔹 Reset Form */
  private resetForm() {
    this.newItemTitle = '';
    this.newItemExtra = '';
    this.newWorkMode = '';
    this.newDays = '';
    this.editingIndex = -1;
    this.isEditing = false;
  }
}
