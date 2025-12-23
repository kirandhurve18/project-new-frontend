import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-settings-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-permission.component.html',
  styleUrls: ['./settings-permission.component.css']
})
export class SettingsPermissionComponent implements OnInit {
  copy_regular_1_icon = `${environment.BASE_PATH_ASSETS}/icons/copy_regular_1_icon.svg`;
  delete_solid_icon = `${environment.BASE_PATH_ASSETS}/icons/delete_solid_icon.svg`;



  roleList: any[] = [];       // Small cards (summary view)
  fullRoleList: any[] = [];   // Detailed list with permissions
  permissions: any[] = [];

  modalTitle = '';
  is_roleOpend: boolean = false;

  // ✅ Role object for Add/Edit
  currentRole: any = {
    _id: '',
    role_name: '',
    description: '',
    is_active: true,
    permissions: [] as any[]
  };

  constructor(private superadminService: Superadmin) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  // ✅ Select all handler
  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.permissions.forEach(p => {
      p.read = checked;
      p.write = checked;
      p.create = checked;
    });
  }

  // ✅ Fetch all roles
  loadRoles() {
    this.superadminService.getRoles().subscribe({
      next: (res: any) => {
        if (res.success) {
          // Small card list
          this.roleList = res.data.map((r: any) => ({
            id: r._id,
            role_name: r.role_name,
            users: r.employeeCount || r.user_count || 0
          }));

          // Detailed role list
          this.fullRoleList = res.data.map((r: any) => {
            const modules = (r.permissions || []).map((perm: any) => ({
              moduleId: perm.menu?._id || perm.menu,
              moduleName: perm.menu?.name || 'Unknown',
              actions: perm.actions || []
            }));

            return {
              id: r._id,
              role_name: r.role_name,
              description: r.description || '',
              modules,
              moduleNames: modules.map((m: any) => m.moduleName).join(', '),
              users: r.employeeCount || r.user_count || 0,
              status: r.is_active ? 'Active' : 'Inactive'
            };
          });
        }
      },
      error: (err: any) => console.error('Error loading roles:', err)
    });
  }

  // ✅ Fetch menus for permissions
  loadPermissions() {
    this.superadminService.getMenus().subscribe({
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

  // ✅ Open Add Role Modal
  openAddRoleModal() {
    this.modalTitle = 'Add Role';
    this.currentRole = { _id: '', role_name: '', description: '', is_active: true, permissions: [] };

    this.permissions.forEach(p => {
      p.read = false;
      p.write = false;
      p.create = false;
    });
  }

  // ✅ Open Edit Role Modal (fetch details by ID)
  openEditRoleModal(role: any) {
    this.is_roleOpend = true;
    this.modalTitle = 'Edit Role';

    // Reset checkboxes
    this.permissions.forEach(p => {
      p.read = false;
      p.write = false;
      p.create = false;
    });

    // Fetch full details of this role
    this.superadminService.getRoleById(role.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          const r = res.data;

          // Fill currentRole
          this.currentRole = {
            _id: r._id,
            role_name: r.role_name,
            description: r.description,
            is_active: r.is_active,
            permissions: r.permissions || []
          };

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

  // ✅ Close modal & reset form
  closeAddRoleModal() {
    this.currentRole = { _id: '', role_name: '', description: '', is_active: true, permissions: [] };
    this.permissions.forEach(p => {
      p.read = false;
      p.write = false;
      p.create = false;
    });
  }

  // ✅ Save (Add or Update Role)
  saveRole() {
    if (!this.currentRole.role_name.trim()) {
      alert('⚠️ Please enter a role name');
      return;
    }

    const rolePayload: any = {
      role_name: this.currentRole.role_name.trim(),
      description: this.currentRole.description || '',
      is_active: this.currentRole.is_active,
      permissions: this.permissions
        .filter(p => p.read || p.write || p.create)
        .map(p => ({
          menu: p._id,
          actions: [
            ...(p.read ? ['read'] : []),
            ...(p.write ? ['write'] : []),
            ...(p.create ? ['create'] : [])
          ]
        }))
    };

    console.log('Payload to save/update:', JSON.stringify(rolePayload, null, 2));

    if (this.modalTitle === 'Add Role') {
      // 🔹 Create
      this.superadminService.addRole(rolePayload).subscribe({
        next: (res) => {
          if (res.success) {
            alert('✅ Role added successfully');

          } else {
            alert(res.message || '❌ Failed to add role');
          }
        },
        error: (err) => {
          console.error('Error adding role:', err);
          alert(err.error?.message || 'Error while adding role');
        }
      });
    } else {
      // 🔹 Update
      const payloadWithId = { ...rolePayload, _id: this.currentRole._id };
      this.superadminService.updateRole(payloadWithId).subscribe({
        next: (res) => {
          if (res.success) {
            alert('✅ Role updated successfully');
            // this.loadRoles();
            // this.closeAddRoleModal();
          } else {
            alert(res.message || '❌ Failed to update role');
          }
        },
        error: (err) => {
          console.error('Error updating role:', err);
          alert(err.error?.message || 'Error while updating role');
        }
      });
    }
  }
}
