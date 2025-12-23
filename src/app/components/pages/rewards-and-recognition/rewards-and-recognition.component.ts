
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rewards-and-recognition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rewards-and-recognition.component.html',
  styleUrls: ['./rewards-and-recognition.component.css']
})
export class RewardsAndRecognitionComponent implements OnInit {

  router: any;

  userRole: string | null = null;

  constructor(private superadmin: Superadmin) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');


    if (!user) {
      this.router.navigate(['/login']);
    }
  }

}
