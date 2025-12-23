import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-view-role-permissions-dialog',
  templateUrl: './view-role-permissions-dialog.html',
  styleUrls: ['./view-role-permissions-dialog.css']
})
export class ViewRolePermissionsDialogComponent {
  @Input() modalTitle = 'Role Permissions';
  @Input() currentRole: any = { name: '', status: 'Active' };
  @Input() roles: any[] = [];
  @Input() permissions: any[] = [];

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  submit() {
    this.onSubmit.emit(this.currentRole);
  }

  close() {
    this.onClose.emit();
  }
}
