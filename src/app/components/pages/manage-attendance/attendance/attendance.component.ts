import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarCommonModule, CalendarEvent } from 'angular-calendar';
import { Subject } from 'rxjs';
import { addMonths, getMonth, getYear, subMonths } from 'date-fns';
// import { CalendarWrapperModule } from '../../../shared/calendar-wrapper/calendar-wrapper-module';
import { CalendarWrapperModule } from '../../../../shared/calendar-wrapper/calendar-wrapper-module';
import { Superadmin } from '../../../../core/services/superadmin';
import { AuthService } from '../../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';
import { format, toZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarCommonModule,
    CalendarWrapperModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;
  arrow_left_icon = `${environment.BASE_PATH_ASSETS}/icons/arrow_left_icon.svg`;
  arrow_right_icon = `${environment.BASE_PATH_ASSETS}/icons/arrow_right_icon.svg`;

  checkedIn = false;
  checkedOut = false;
  employee_id: string = '';

  checkInDate = "";
  checkOutDate = "";
  checkInTime = "";
  checkedOutTime = "";

  is_clicked: boolean = false;

  attendanceData: any[] = []; // API response
  attendanceMap: { [key: string]: any } = {};

  viewDate: Date = new Date();
  refresh: Subject<void> = new Subject<void>();

  events: CalendarEvent[] = [];

  holidays = [1, 5, 10];
  paidLeaves = [2, 12];
  unpaidLeaves = [3, 7];
  timesheetSubmitted = [4, 8, 9];

  constructor(
    private superadminService: Superadmin,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  // ---- Month navigation ----
  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    // console.log("this.viewDate --> ", this.viewDate);

    this.fetchAttendance();
    this.refresh.next();
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.fetchAttendance();
    this.refresh.next();
  }

  // ---- Handle button click ----
  handleClick(): void {
    console.log("this.checkedIn ---> ", this.checkedIn)
    console.log("this.checkedOut ---> ", this.checkedOut)

    if (!this.checkedIn) {
      this.checkIn();
    } else if (this.checkedIn && !this.checkedOut) {
      this.checkOut();
    }
  }

  // ---- Check-In ----
  async checkIn(): Promise<void> {
    if (!this.employee_id) return;
    this.is_clicked = true;
    try {
      let coords = null
      try {
        coords = await this.getCurrentLocation();
        console.log("coords success--> --> ", coords)
        if (!coords.latitude && !coords.longitude) {
          coords = { latitude: '18.5717895', longitude: '73.9006975' }
        } else {
          coords = { latitude: coords.latitude.toString(), longitude: coords.latitude.toString() }
          console.log("coords success--> --> ", coords)
        }
      } catch (error) {
        coords = { latitude: '18.5717895', longitude: '73.9006975' }
        console.log("coords error---> ", error);
        // console.log("coords ---> fail--> ", coords)
      }
      console.log("coords success--> --> ", coords)


      // return;
      const payload = {
        employee_id: this.employee_id,
        checkin_location: 'Office',
        latitude: coords?.latitude?.toString() || '',
        longitude: coords?.longitude.toString() || '',
      };

      console.log('📤 Sending check-in payload:', payload);

      this.superadminService.checkIn(payload).subscribe({
        next: (res) => {
          console.log('✅ Check-in successful:', res);
          this.checkedIn = false;
          this.events.push({
            start: new Date(),
            title: 'Present (Checked In)',
            allDay: true,
            color: { primary: '#28a745', secondary: '#D4EDDA' },
          });

          this.refreshAttendance();
          this.refresh.next();
          this.is_clicked = false;
          this.toastr.success('Checked In Successfully ✅');  // ✅ Toast instead of alert
        },
        error: (err) => {
          this.is_clicked = false;
          console.error('Check-in failed:', err);
          this.toastr.error(err?.error?.message || 'Check-in Failed ');
        },
      });
    } catch (err) {
      this.is_clicked = false;
      console.error('Check-in failed:', err);
      this.toastr.error('Check In Failed');
    }
  }


  // ---- Check-Out ----
  async checkOut(): Promise<void> {
    if (!this.employee_id) return;
    this.is_clicked = true;
    try {
      let coords = null
      try {
        coords = await this.getCurrentLocation();
        console.log("coords success--> --> ", coords)
        if (!coords.latitude && !coords.longitude) {
          coords = { latitude: '18.5717895', longitude: '73.9006975' }
        } else {
          coords = { latitude: coords.latitude.toString(), longitude: coords.latitude.toString() }
          console.log("coords success--> --> ", coords)
        }
      } catch (error) {
        coords = { latitude: '18.5717895', longitude: '73.9006975' }
        console.log("coords error---> ", error);
        // console.log("coords ---> fail--> ", coords)
      }

      // return;
      const payload = {
        employee_id: this.employee_id,
        checkout_location: 'Office',
        latitude: coords?.latitude || '',
        longitude: coords?.longitude || '',
      };

      console.log('📤 Sending check-out payload:', payload);

      this.superadminService.checkOut(payload).subscribe({
        next: (res) => {
          this.is_clicked = false;
          this.events = this.events.map((event) =>
            event.start.toDateString() === new Date().toDateString()
              ? { ...event, title: 'Present (Checked Out)' }
              : event
          );

          this.refreshAttendance();
          this.refresh.next();
          this.toastr.success('Checked Out Successfully'); // Toast instead of alert
        },
        error: (err) => {
          this.is_clicked = false;
          console.error('Check-out failed:', err);
          this.toastr.error(err?.error?.message || 'Check-out Failed'); // ✅
        },

      });
    } catch (err) {
      this.is_clicked = false;
      console.error('Check-out failed:', err);
      this.toastr.error('Check-out Failed'); // ✅
    }
  }

  private refreshAttendance(): void {
    this.superadminService.getAttendance({ employee_id: this.employee_id }).subscribe({
      next: (res) => {
        let data = res.data || {}
        this.checkedIn = data.checkin_time && true;
        this.checkedOut = data.checkout_time && true;
        this.checkInDate = data.checkin_date;
        this.checkOutDate = data.checkout_date;
        this.checkInTime = data.checkin_time;
        this.checkedOutTime = data.checkout_time;
      },
      error: (err) => {
        console.error('❌ Check-in failed:', err);
      },
    });
  }

  private fetchAttendance(month: void, year: void): void {

    // console.log("this.viewDate ---> ", this.viewDate)
    const baseDate = this.viewDate
      ? this.viewDate  // parse string/ISO date
      : new Date();

    // console.log("baseDate ---> ", baseDate)
    // convert to Asia/Kolkata timezone
    const zonedDate = toZonedTime(baseDate, 'Asia/Kolkata');

    // console.log("zonedDate ---> ", zonedDate);
    // console.log("getMonth(zonedDate) ---> ", getMonth(zonedDate));
    // get month (0–11, so add +1 to match)
    const currentMonth = (getMonth(zonedDate) + 1).toString();  // 1–12
    const currentYear = (getYear(zonedDate)).toString();        // e.g. 2025

    // console.log("currentMonth ---> ", currentMonth);
    // console.log("currentYear ---> ", currentYear);

    this.superadminService.getMonthlyAttendance({
      employee_id: this.employee_id, month: currentMonth,
      year: currentYear
    }).subscribe({
      next: (res) => {
        console.log('✅ Monthly Attendance Fetched:', res);

        if (res.success && res.data) {
          this.attendanceMap = {};
          res.data.forEach((item: any) => {
            this.attendanceMap[item.date] = item;
          });
        }
      },
      error: (err) => {
        console.error('❌ Monthly Attendace failed:', err);
      },
    });
  }

  // ---- Button label ----
  getButtonLabel(): string {
    if (!this.checkedIn) return 'Check In';
    if (this.checkedIn && !this.checkedOut) return 'Check Out';
    return 'Checked Out';
  }

  // ---- Helpers for calendar display ----
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isHoliday(date: Date): boolean {
    return this.holidays.includes(date.getDate());
  }

  isPaidLeave(date: Date): boolean {
    return this.paidLeaves.includes(date.getDate());
  }

  isUnpaidLeave(date: Date): boolean {
    return this.unpaidLeaves.includes(date.getDate());
  }

  isTimesheetSubmitted(date: Date): boolean {
    return this.timesheetSubmitted.includes(date.getDate());
  }



  getDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd', { timeZone: 'Asia/Kolkata' });
  }

  ngOnInit(): void {
    console.log('🔍 Attendance component loaded');
    this.employee_id = this.authService.getEmployeeId();

    if (!this.employee_id) {
      alert('❌ No employee ID found. Please log in again.');
      return;
    }
    console.log('📌 Loaded employee_id:', this.employee_id);

    // const address = this.getAddressFromLatLng(18.5204, 73.8567); // Pune coords
    // console.log("Address:", address);
    // this.getAddressFromLatLng('18.5671469', '73.9205394');

    this.refreshAttendance();
    this.fetchAttendance();
  }


  private getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('❌ Location error:', error);
            reject(error);
          }
        );
      } else {
        // reject(new Error('Geolocation not supported'));
      }
    });
  }


  // getAddressFromLatLng() {
  //   try {
  //     // const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  //     // const response = await axios.get(url, {
  //     //   headers: { "User-Agent": "Vibhu" },
  //     // });

  //     // return response.data.display_name;
  //   } catch (error) {
  //     console.error('Error getting location:', error);
  //     return { latitude: '', longitude: '' };
  //   }
  // }

}
