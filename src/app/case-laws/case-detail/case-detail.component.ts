import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseLawService, CaseLawWithDetail } from '../services/case-law.service';

@Component({
  selector: 'app-case-detail',
  templateUrl: './case-detail.component.html',
  styleUrls: ['./case-detail.component.scss']
})
export class CaseDetailComponent implements OnInit {
  caseLaw: CaseLawWithDetail | null = null;
  loading = false;
  error: string | null = null;
  tid: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseLawService: CaseLawService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tidParam = params.get('tid');
      if (tidParam) {
        this.tid = parseInt(tidParam, 10);
        this.loadCaseDetail();
      }
    });
  }

  loadCaseDetail(): void {
    this.loading = true;
    this.error = null;

    this.caseLawService.getCaseLawById(this.tid).subscribe({
      next: (data) => {
        if (data) {
          this.caseLaw = data;
          console.log('Successfully loaded case law:', this.caseLaw);
        } else {
          this.error = 'Case not found';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading case detail:', error);
        
        if (error.status === 404) {
          this.error = `Case law with ID ${this.tid} could not be found.`;
        } else if (error.status === 500) {
          this.error = 'The server encountered an error while processing your request.';
        } else {
          this.error = 'Failed to load case details. Please try again later.';
        }
        
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/case-laws']);
  }

  formatDate(dateValue: string | Date): string {
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) {
        return String(dateValue);
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return String(dateValue);
    }
  }

  stripHtmlTags(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
