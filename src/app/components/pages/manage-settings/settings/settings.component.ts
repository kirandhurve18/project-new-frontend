
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule,  RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

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
