import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Define interfaces based on our schema
export interface CaseLawData {
  id: string;
  tid: number;
  authorid?: number | null;
  bench?: string | null;
  catids?: string | null;
  docsize?: number | null;
  docsource: string;
  doctype?: number | null;
  fragment?: boolean | null;
  headline?: string | null;
  numcitedby: number;
  numcites: number;
  publishdate: string;
  title: string;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
  taxSection?: string | null;
}

export interface CaseDetailData {
  id: string;
  tid: number;
  agreement: boolean;
  citetid?: number | null;
  courtcopy: boolean;
  divtype?: string | null;
  doc: string;
  docsource: string;
  numcitedby: number;
  numcites: number;
  publishdate: string;
  queryAlert?: any;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseLawWithDetail extends CaseLawData {
  caseDetail?: CaseDetailData | null;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CaseLawsResponse {
  caseLaws: CaseLawWithDetail[];
  pagination?: PaginationData;
}

@Injectable({
  providedIn: 'root'
})
export class CaseLawService {
  private apiUrl = '/api/case-laws'; // Backend API endpoint

  // Mock data for development
  private mockCaseLaws: CaseLawWithDetail[] = [
    {
      id: '1',
      tid: 1001,
      title: 'State Tax Commissioner vs. ABC Industries Ltd.',
      headline: 'GST liability on inter-state transactions',
      docsource: 'High Court',
      numcitedby: 25,
      numcites: 15,
      publishdate: '2024-01-15',
      category: 'GST',
      taxSection: 'SECTION_7_GST',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      caseDetail: {
        id: '101',
        tid: 1001,
        agreement: false,
        courtcopy: true,
        doc: 'Full text of the case judgment including legal arguments and citations...',
        docsource: 'High Court',
        numcitedby: 25,
        numcites: 15,
        publishdate: '2024-01-15',
        title: 'State Tax Commissioner vs. ABC Industries Ltd.',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    },
    {
      id: '2',
      tid: 1002,
      title: 'XYZ Corporation vs. Income Tax Department',
      headline: 'Deduction under Section 80C disputed',
      docsource: 'ITAT',
      numcitedby: 18,
      numcites: 22,
      publishdate: '2024-02-20',
      category: 'INCOME_TAX',
      taxSection: 'SECTION_139_IT',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      caseDetail: {
        id: '102',
        tid: 1002,
        agreement: true,
        courtcopy: false,
        doc: 'The full text of the judgment discussing Section 80C deductions and related tax provisions...',
        docsource: 'ITAT',
        numcitedby: 18,
        numcites: 22,
        publishdate: '2024-02-20',
        title: 'XYZ Corporation vs. Income Tax Department',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20')
      }
    },
    {
      id: '3',
      tid: 1003,
      title: 'Supreme Court Judgment on Tax Evasion',
      headline: 'Penalty provisions under Income Tax Act',
      docsource: 'Supreme Court',
      numcitedby: 45,
      numcites: 35,
      publishdate: '2024-03-10',
      category: 'SUPREME_COURT',
      taxSection: 'SECTION_143_IT',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
      caseDetail: {
        id: '103',
        tid: 1003,
        agreement: true,
        courtcopy: true,
        doc: 'This judgment by the Supreme Court establishes important precedents regarding tax evasion cases...',
        docsource: 'Supreme Court',
        numcitedby: 45,
        numcites: 35,
        publishdate: '2024-03-10',
        title: 'Supreme Court Judgment on Tax Evasion',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10')
      }
    },
    {
      id: '4',
      tid: 1987394,
      title: 'CIT vs. Sharma Industries Ltd.',
      headline: 'Important ruling on input tax credit eligibility under GST regime',
      docsource: 'High Court of Delhi',
      numcitedby: 32,
      numcites: 18,
      publishdate: '2024-05-15',
      category: 'GST',
      taxSection: 'SECTION_16_GST',
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-05-20'),
      caseDetail: {
        id: '104',
        tid: 1987394,
        agreement: false,
        courtcopy: true,
        doc: 'This landmark judgment from the Delhi High Court clarifies the provisions related to input tax credit eligibility under Section 16 of the CGST Act. The court held that...',
        docsource: 'High Court of Delhi',
        numcitedby: 32,
        numcites: 18,
        publishdate: '2024-05-15',
        title: 'CIT vs. Sharma Industries Ltd.',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-05-20')
      }
    },
    {
      id: '4',
      tid: 1004,
      title: 'Municipal Corporation vs. Hotel Chain Ltd.',
      headline: 'Service tax applicability on hospitality sector',
      docsource: 'High Court',
      numcitedby: 12,
      numcites: 8,
      publishdate: '2024-04-05',
      category: 'GST',
      taxSection: 'SECTION_16_GST',
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05')
    },
    {
      id: '5',
      tid: 1005,
      title: 'Banking Sector Tax Compliance Case',
      headline: 'TDS provisions for banking transactions',
      docsource: 'ITAT',
      numcitedby: 20,
      numcites: 18,
      publishdate: '2024-05-12',
      category: 'INCOME_TAX',
      taxSection: 'SECTION_139_IT',
      createdAt: new Date('2024-05-12'),
      updatedAt: new Date('2024-05-12')
    }
  ];

  constructor(private http: HttpClient) { }

  getAllCaseLaws(page: number = 1, limit: number = 20): Observable<CaseLawsResponse> {
    // Real API call
    return this.http.get<CaseLawsResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
    
    // Uncomment below for mock data if API is not available
    // const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;
    // const paginatedData = this.mockCaseLaws.slice(startIndex, endIndex);
    // return of({ caseLaws: paginatedData }).pipe(delay(500));
  }

  getCaseLawById(tid: number): Observable<CaseLawWithDetail | null> {
    console.log(`Fetching case law with TID: ${tid}`);
    
    // Real API call with fallback to mock data
    return this.http.get<CaseLawWithDetail>(`${this.apiUrl}/${tid}`)
      .pipe(
        catchError(error => {
          console.error('API error when fetching case law:', error);
          
          // Check if we have this in mock data as fallback
          const mockCaseLaw = this.mockCaseLaws.find(c => c.tid === tid);
          if (mockCaseLaw) {
            console.log('Falling back to mock data for demo purposes');
            return of(mockCaseLaw);
          }
          
          // If not in mock data either, rethrow the error
          return throwError(() => error);
        })
      );
  }

  getCaseLawsByCategory(category: string, page: number = 1, limit: number = 20): Observable<CaseLawsResponse> {
    // Real API call
    return this.http.get<CaseLawsResponse>(`${this.apiUrl}?category=${category}&page=${page}&limit=${limit}`);
    
    // Uncomment below for mock data if API is not available
    // const filtered = this.mockCaseLaws.filter(c => c.category === category);
    // const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;
    // const paginatedData = filtered.slice(startIndex, endIndex);
    // return of({ caseLaws: paginatedData }).pipe(delay(500));
  }

  getCaseLawsByTaxSection(taxSection: string, page: number = 1, limit: number = 20): Observable<CaseLawsResponse> {
    // Real API call
    return this.http.get<CaseLawsResponse>(`${this.apiUrl}?taxSection=${taxSection}&page=${page}&limit=${limit}`);
    
    // Uncomment below for mock data if API is not available
    // const filtered = this.mockCaseLaws.filter(c => c.taxSection === taxSection);
    // const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;
    // const paginatedData = filtered.slice(startIndex, endIndex);
    // return of({ caseLaws: paginatedData }).pipe(delay(500));
  }

  searchCaseLaws(searchTerm: string, page: number = 1, limit: number = 20): Observable<CaseLawsResponse> {
    console.log(`Searching for case laws with term: "${searchTerm}"`);
    
    if (!searchTerm.trim()) {
      console.log('Empty search term, returning all case laws');
      return this.getAllCaseLaws(page, limit);
    }
    
    // Real API call with fallback to mock data
    return this.http.get<CaseLawsResponse>(`${this.apiUrl}/search/${encodeURIComponent(searchTerm)}?page=${page}&limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Error searching case laws from API:', error);
          
          // Fall back to mock data if API fails
          console.log('Falling back to mock data for search');
          const filtered = this.mockCaseLaws.filter(c => 
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.headline && c.headline.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filtered.slice(startIndex, endIndex);
          
          return of({ 
            caseLaws: paginatedData,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(filtered.length / limit),
              totalCount: filtered.length,
              hasNext: endIndex < filtered.length,
              hasPrev: page > 1
            }
          }).pipe(delay(300));
        })
      );
  }

  getCaseLawsCount(): Observable<{ count: number }> {
    // Real API call
    interface StatsResponse {
      total: number;
      byCategory: Record<string, number>;
      byTaxSection: Record<string, number>;
    }
    
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/count`)
      .pipe(
        map(response => ({ count: response.total || 0 }))
      );
    
    // Uncomment below for mock data if API is not available
    // return of({ count: this.mockCaseLaws.length }).pipe(delay(200));
  }

  getCaseLawsCountByCategory(category: string): Observable<{ count: number }> {
    // Real API call
    interface StatsResponse {
      total: number;
      byCategory: Record<string, number>;
      byTaxSection: Record<string, number>;
    }
    
    return this.http.get<StatsResponse>(`${this.apiUrl}/stats/count`)
      .pipe(
        map(response => {
          const count = response.byCategory && response.byCategory[category] || 0;
          return { count };
        })
      );
    
    // Uncomment below for mock data if API is not available
    // const count = this.mockCaseLaws.filter(c => c.category === category).length;
    // return of({ count }).pipe(delay(200));
  }
}
