import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { SpinnerHelper } from '../../../core/services/spinner-helper';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  background_1 = `${environment.BASE_PATH_ASSETS}/icons/background_1.jpg`;
  destek_signature = `${environment.BASE_PATH_ASSETS}/icons/destek_signature.svg`;

  loginForm!: FormGroup;
  showPassword = false;
  submitted = false;
  logoExists = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private spinner = inject(SpinnerHelper);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.router.navigate(['/main/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        ]
      ],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.toastr.info("Please Fill Details")
      return;
    }

    const credentials = this.loginForm.value;
    this.spinner.show();

    this.auth.login(credentials).subscribe({
      next: (response) => {
        this.spinner.hide();
        console.log('Login API response:', response);

        if (response.success && response.data) {
          this.toastr.success("Login Successfully")

          try {
            const user: Object = response.data;
            const token: string = response.data.token;
            const role_id: string = response.data.role_id;
            const email: string = response.data.email;
            const employee_id: string = response.data._id;
            const full_name: string = response.data.full_name;
            const is_team_lead: boolean = response.data.is_team_lead;
            const is_team_manager: boolean = response.data.is_team_manager;
            const is_super_admin: boolean = response.data.is_super_admin;
            const designation_name: string = response.data.designation_name;
            const work_mode: string = response.data.work_mode;

            let userRole: string = '0';
            if (is_super_admin) {
              userRole = '1';
            } else if (is_team_manager) {
              userRole = '2';
            } else if (is_team_lead) {
              userRole = '3';
            }

            this.auth.storeAuthData(
              token,
              employee_id,
              email,
              role_id,
              full_name,
              userRole,
              designation_name,
              user,
              work_mode,
            );

            this.router.navigate(['/main/dashboard']);
          } catch (error) {
            console.log("error in storing login details ---> ", error);
          }
        } else {
          this.toastr.error(response.message)
          // this.loginForm.get('email')?.setErrors({ invalid: true });
          // this.loginForm.get('password')?.setErrors({ invalid: true });
        }
      },
      error: (err) => {
        this.spinner.hide();
          this.toastr.error(err.error.message)
        // ❌ Instead of alert → mark both fields invalid
        // this.loginForm.get('email')?.setErrors({ invalid: true });
        // this.loginForm.get('password')?.setErrors({ invalid: true });
      }
    });
  }
}
