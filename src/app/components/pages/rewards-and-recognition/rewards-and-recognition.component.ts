import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../core/services/superadmin';

@Component({
  selector: 'app-rewards-and-recognition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rewards-and-recognition.component.html',
  styleUrls: ['./rewards-and-recognition.component.css']
})
export class RewardsAndRecognitionComponent implements OnInit {

  userRole: string | null = null;
  selectedCategory = 'Monthly Winners';
  currentMonth = 'June';
  currentYear = new Date().getFullYear();

  leaders: any[] = [];
  performers: any[] = [];
  monthlyWinner: any = { leader: null, performer: null };

  selectedYear: number = new Date().getFullYear();

  leadersByYear: { [year: number]: any[] } = {};
  performersByYear: { [year: number]: any[] } = {};

  months: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ];

  // 🔹 Employee Dropdown Data
  employees: any[] = [];
  selectedEmployee: any = null;
  selectedDesignation: string = '';
  selectedDepartment: string = '';
  designations: any[] = [];
  departments: any[] = [];

  // 🔹 Add Winner Form Data
  winnerCategory: string = '';
  uploadedFile: File | null = null;

  constructor(private superadmin: Superadmin) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role');

    // Load dropdown data
    this.loadEmployees();
    this.loadDesignations();
    this.loadDepartments();

    // Demo Leaders Data 2025
    this.leadersByYear[2025] = this.generateYearData(2025, {
      2: { name: 'Alish Verma', imageUrl: 'assets/images/alish.svg', designation: 'Associate Manager' },
      3: { name: 'Omm Gaikwad', imageUrl: 'assets/images/om.svg', designation: 'Business Analyst' },
      4: { name: 'Vibha Shinde', imageUrl: 'assets/images/vibha.svg', designation: 'Human Resources' },
      5: { name: 'Shrikant ', imageUrl: 'assets/images/shrikant.svg', designation: 'Executive - Back Office' },
      6: { name: 'Pawan Khaire', imageUrl: 'assets/images/pawan.png', designation: 'Executive - Mobile Development' }
    });

    // Demo Performers Data 2025
    this.performersByYear[2025] = this.generateYearData(2025, {
      2: { name: 'Tejas Manjarkar', imageUrl: 'assets/images/tejas.png', designation: 'Software Tester' },
      3: { name: 'Omm Gaikwad', imageUrl: 'assets/images/om.svg', designation: 'Buisness Analyst' },
      4: { name: 'Pawan Khaire', imageUrl: 'assets/images/pawan.png', designation: 'Executive - Mobile Development' }
    });

    this.leaders = this.leadersByYear[2025].slice(0, 3);
    this.performers = this.performersByYear[2025].slice(0, 3);

    this.monthlyWinner = {
      leader: this.leadersByYear[2025][5],
      performer: this.performersByYear[2025][4]
    };
  }

  // 🔹 Fetch employees from API
  loadEmployees() {
    this.superadmin.getAllEmployeesList().subscribe({
      next: (res) => {
        this.employees = res.data || res;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

// 🔹 Fetch Designations
loadDesignations() {
  this.superadmin.getDesignations().subscribe({
    next: (res: any) => {
      this.designations = res.data || [];  // <-- assign the "data" array
      console.log("Designations fetched:", this.designations);
    },
    error: (err) => console.error('Error fetching designations:', err)
  });
}

// 🔹 Fetch Departments
loadDepartments() {
  this.superadmin.getDepartments().subscribe({
    next: (res: any) => {
      this.departments = res.data || [];  // <-- assign the "data" array
      console.log("Departments fetched:", this.departments);
    },
    error: (err) => console.error('Error fetching departments:', err)
  });
}


  // 🔹 Handle employee selection
  onEmployeeSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const empId = selectElement.value;

    const emp = this.employees.find(e => e._id === empId);
    if (emp) {
      this.selectedEmployee = emp;

      // auto-select based on API fields
      this.selectedDesignation = emp.designation_id || emp.designation || '';
      this.selectedDepartment = emp.department_id || emp.department || '';
    }
  }

  // 🔹 Handle file upload
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadedFile = event.target.files[0];
    }
  }

  // 🔹 Submit Winner API Call
  submitWinner() {
    if (!this.selectedEmployee || !this.winnerCategory) {
      alert('Please select employee and category.');
      return;
    }

    const formData = new FormData();
    formData.append('employee_id', this.selectedEmployee._id);
    formData.append('designation', this.selectedDesignation);
    formData.append('department', this.selectedDepartment);
    formData.append('category', this.winnerCategory);

    if (this.uploadedFile) {
      formData.append('image', this.uploadedFile);
    }

    // API call placeholder
    // this.superadmin.addWinner(formData).subscribe({
    //   next: (res) => {
    //     alert('Winner added successfully!');
    //     this.resetForm();
    //   },
    //   error: (err) => {
    //     console.error('Error adding winner:', err);
    //   }
    // });
  }

  resetForm() {
    this.selectedEmployee = null;
    this.selectedDesignation = '';
    this.selectedDepartment = '';
    this.winnerCategory = '';
    this.uploadedFile = null;
  }

  // 🔹 Utility for dummy winners data
  generateYearData(year: number, winners: { [monthIndex: number]: any } = {}): any[] {
    return this.months.map((m, idx) => {
      if (winners[idx]) {
        return {
          ...winners[idx],
          month: `${m} ${year}`
        };
      }
      return {
        name: 'NA',
        imageUrl: null,
        designation: '-',
        month: `${m} ${year}`
      };
    });
  }

  prevYear(type: 'leader' | 'performer') {
    this.selectedYear--;
    if (type === 'leader' && !this.leadersByYear[this.selectedYear]) {
      this.leadersByYear[this.selectedYear] = this.generateYearData(this.selectedYear);
    }
    if (type === 'performer' && !this.performersByYear[this.selectedYear]) {
      this.performersByYear[this.selectedYear] = this.generateYearData(this.selectedYear);
    }
  }

  nextYear(type: 'leader' | 'performer') {
    this.selectedYear++;
    if (type === 'leader' && !this.leadersByYear[this.selectedYear]) {
      this.leadersByYear[this.selectedYear] = this.generateYearData(this.selectedYear);
    }
    if (type === 'performer' && !this.performersByYear[this.selectedYear]) {
      this.performersByYear[this.selectedYear] = this.generateYearData(this.selectedYear);
    }
  }

  setCategory(category: string) {
    this.selectedCategory = category;
  }
}
