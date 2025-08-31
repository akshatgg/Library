import { Component, OnInit } from '@angular/core';
import { CaseLawService, CaseLawWithDetail } from '../services/case-law.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {
  caseLaws: CaseLawWithDetail[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalCount = 0;
  pageSize = 20;
  searchTerm = '';
  selectedCategory = 'all';
  selectedTaxSection = 'all';

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ITAT', label: 'ITAT' },
    { value: 'GST', label: 'GST' },
    { value: 'INCOME_TAX', label: 'Income Tax' },
    { value: 'HIGH_COURT', label: 'High Court' },
    { value: 'SUPREME_COURT', label: 'Supreme Court' },
    { value: 'TRIBUNAL_COURT', label: 'Tribunal Court' }
  ];

  taxSections = [
    { value: 'all', label: 'All Sections' },
    { value: 'SECTION_7_GST', label: 'Section 7 GST' },
    { value: 'SECTION_16_GST', label: 'Section 16 GST' },
    { value: 'SECTION_17_GST', label: 'Section 17 GST' },
    { value: 'SECTION_139_IT', label: 'Section 139 IT' },
    { value: 'SECTION_143_IT', label: 'Section 143 IT' },
    // Add more as needed
  ];

  constructor(
    private caseLawService: CaseLawService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCaseLaws();
    this.loadTotalCount();
  }

  loadCaseLaws(): void {
    this.loading = true;
    this.error = null;

    let observable;

    if (this.searchTerm) {
      observable = this.caseLawService.searchCaseLaws(this.searchTerm, this.currentPage, this.pageSize);
    } else if (this.selectedCategory !== 'all') {
      observable = this.caseLawService.getCaseLawsByCategory(this.selectedCategory, this.currentPage, this.pageSize);
    } else if (this.selectedTaxSection !== 'all') {
      observable = this.caseLawService.getCaseLawsByTaxSection(this.selectedTaxSection, this.currentPage, this.pageSize);
    } else {
      observable = this.caseLawService.getAllCaseLaws(this.currentPage, this.pageSize);
    }

    observable.subscribe({
      next: (response) => {
        this.caseLaws = response.caseLaws || [];
        
        // Update pagination if available
        if (response.pagination) {
          this.totalCount = response.pagination.totalCount;
          this.currentPage = response.pagination.currentPage;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load case laws';
        this.loading = false;
        console.error('Error loading case laws:', error);
      }
    });
  }

  loadTotalCount(): void {
    this.caseLawService.getCaseLawsCount().subscribe({
      next: (response) => {
        this.totalCount = response.count;
      },
      error: (error) => {
        console.error('Error loading total count:', error);
      }
    });
  }

  onSearch(): void {
    // Reset other filters when searching
    this.currentPage = 1;
    this.selectedCategory = 'all';
    this.selectedTaxSection = 'all';
    
    console.log(`Performing search with term: "${this.searchTerm}"`);
    this.loadCaseLaws();
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadCaseLaws();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.selectedTaxSection = 'all';
    this.searchTerm = '';
    this.loadCaseLaws();
  }

  onTaxSectionChange(): void {
    this.currentPage = 1;
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.loadCaseLaws();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadCaseLaws();
    
    // Scroll back to top of results
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
      window.scrollTo({ 
        top: resultsSection.getBoundingClientRect().top + window.scrollY - 100, 
        behavior: 'smooth' 
      });
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadCaseLaws();
  }

  viewCaseDetail(tid: number): void {
    this.router.navigate(['/case-laws', tid]);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
  
  /**
   * Generate a range of page numbers to display
   * Shows pages around the current page for better navigation
   * Uses a more responsive approach based on screen width
   */
  getPageRange(): number[] {
    const range: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    // Default max visible page buttons (adjustable based on screen size)
    const maxVisible = window.innerWidth < 576 ? 3 : 
                       window.innerWidth < 768 ? 5 : 7;
    
    // Calculate how many pages to show on each side of current page
    const sidePagesCount = Math.floor((maxVisible - 1) / 2);
    
    // Calculate start and end page numbers
    let start = Math.max(2, currentPage - sidePagesCount);
    let end = Math.min(totalPages - 1, currentPage + sidePagesCount);
    
    // Adjust if we're near the start
    if (currentPage - sidePagesCount < 2) {
      end = Math.min(1 + maxVisible, totalPages - 1);
    }
    
    // Adjust if we're near the end
    if (currentPage + sidePagesCount >= totalPages) {
      start = Math.max(2, totalPages - maxVisible);
    }
    
    // Generate page numbers
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) { // Exclude first and last pages as they're shown separately
        range.push(i);
      }
    }
    
    return range;
  }

  formatDate(dateValue: string | Date): string {
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) {
        return String(dateValue);
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(dateValue);
    }
  }

  truncateText(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }
}
