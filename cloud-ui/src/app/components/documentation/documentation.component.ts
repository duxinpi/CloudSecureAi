import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}

