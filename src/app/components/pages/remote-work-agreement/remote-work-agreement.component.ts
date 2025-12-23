
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-remote-work-agreement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './remote-work-agreement.component.html',
  styleUrls: ['./remote-work-agreement.component.css']
})
export class RemoteWorkAgreementComponent implements OnInit {
  router: any;

  userRole: string | null = null;
  employee_id: string = '';
  full_name: string = '';
  designation_name: string = '';
  is_aggrement_accepted: boolean = false;
  is_aggrement_accepted_date: Date|string = '';
  is_submitted: boolean = true;
  currentDate: string|Date = '';

  constructor(
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id') || '';
    this.full_name = localStorage.getItem('full_name') || '';
    this.designation_name = localStorage.getItem('designation_name') || '';

    if (!user) {
      this.router.navigate(['/login']);
    }
    this.currentDate = new Date();
    this.getAggrementStatus()
  }

  onAcceptAgrement() {
    // console.log("this.is_aggrement_accepted ---> ", this.is_aggrement_accepted);

    this.employeeService.acceptRemoteWorkAggrement(this.employee_id, this.is_aggrement_accepted).subscribe({
      next: (response) => {
        console.log('response --> ', response)
        if (response?.success) {
          this.toastr.success(response.message);
          this.getAggrementStatus();
        } else {
          if(response.type == 'info') this.toastr.info(response.message);
          else this.toastr.error(response.message);
        }
      },
      error: (error) => {
        if(error.error && error.error.type && error.error.type == 'info'){
          this.toastr.info(error.error.message);
        } else {
          this.toastr.error(error.error.message);

        }
      },
    })
  }

  getAggrementStatus() {
    this.employeeService.getRemoteWorkAgreementStatus(this.employee_id).subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          this.is_submitted = response.data.rw_agreement_accepted;
          this.is_aggrement_accepted = response.data.rw_agreement_accepted ;
          this.is_aggrement_accepted_date = response.data.rw_agreement_accepted_date ;
        }
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    })
  }
}
