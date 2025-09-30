import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Superadmin } from '../../../core/services/superadmin';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-festival',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './festival.component.html',
  styleUrls: ['./festival.component.css']
})
export class FestivalComponent implements OnInit {
  userRole: string | null = null;
  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.svg`;
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;

  // filters + pagination
  searchTerm: string = '';
  entriesToShow: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 0;

  festivals: any[] = [];

  // Modal state
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  // Models
  newFestival = { name: '', date: '', isFixed: false };
  editFestival: any = null;

  loading: boolean = false;
  Math = Math;

  constructor(private router: Router, private superadmin: Superadmin, private toastr: ToastrService) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');

    if (!user) {
      this.router.navigate(['/login']);
    }
    this.loadFestivals();
  }

  // Fetch Festivals (with pagination + search)
  loadFestivals(page: number = this.currentPage) {
    this.loading = true;
    this.superadmin
      .getFestivalLeaves(page, this.entriesToShow, this.searchTerm)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.festivals =
            res?.data?.map((item: any, index: number) => ({
              sr: (page - 1) * this.entriesToShow + (index + 1),
              name: item.festival_name,
              date: item.festival_date,
              day: item.festival_weekday,
              festival_id: item.festival_id
            })) || [];

          this.totalItems = res?.total || this.festivals.length;
          this.totalPages = Math.ceil(this.totalItems / this.entriesToShow);
          this.currentPage = page;
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to load festival leaves:', err);
        }
      });
  }

  // Pagination Controls
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadFestivals(page);
    }
  }

  // Trigger search
  onSearchChange() {
    this.currentPage = 1;
    this.loadFestivals();
  }

  // Add Festival Modal
  openAddFestival() {
    this.showAddModal = true;
  }
  closeAddFestival() {
    this.showAddModal = false;
    this.newFestival = { name: '', date: '', isFixed: false };
  }

  // Add Festival Submit
  submitFestival() {
    if (!this.newFestival.name || !this.newFestival.date) {
      alert('Please fill in all fields');
      return;
    }

    const payload = {
      festival_name: this.newFestival.name,
      festival_date: this.newFestival.date,
      is_every_year: this.newFestival.isFixed
    };

    this.loading = true;
    this.superadmin.addFestivalLeaves(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if(response && response.success){
          this.toastr.success(response.message)
          this.loadFestivals(1); // reload from first page
          this.closeAddFestival();
        } else {
          this.toastr.error(response.message)
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error.message)
      }
    });
  }

  // Edit Festival Modal
  openEditFestival(festivalId: string) {
    this.loading = true;
    this.superadmin.getFestivalLeaveById(festivalId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const data = res.data;
          this.editFestival = {
            festival_id: data._id,
            name: data.festival_name,
            date: data.festival_date.split('T')[0], // YYYY-MM-DD
            isFixed: data.is_every_year
          };
          this.showEditModal = true;
        } else {
          alert('Failed to fetch festival details.');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to fetch festival by id:', err);
        alert('Error fetching festival details.');
      }
    });
  }
  closeEditFestival() {
    this.showEditModal = false;
    this.editFestival = null;
  }

  // Update Festival Submit
  submitEditFestival() {
    if (!this.editFestival.name || !this.editFestival.date) {
      this.toastr.error('Please fill in all fields');
      return;
    }

    const payload = {
      festival_id: this.editFestival.festival_id, // REQUIRED for backend
      festival_name: this.editFestival.name,
      festival_date: this.editFestival.date,
      is_every_year: this.editFestival.isFixed ?? false
    };

    this.loading = true;
    this.superadmin.updateFestivalLeave(payload).subscribe({
      next: (response) => {
        this.loading = false;
         if(response && response.success){
          this.toastr.success(response.message)
          this.loadFestivals(this.currentPage);
          this.closeEditFestival();
        } else {
          this.toastr.error(response.message)
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err.error.message);
        // console.error('Failed to update festival:', err);
        // alert('Failed to update festival. Please try again.');
      }
    });
  }
}
