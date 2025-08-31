import { TestBed } from '@angular/core/testing';

import { CaseLawService } from './case-law.service';

describe('CaseLawService', () => {
  let service: CaseLawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseLawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
