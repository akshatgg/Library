import { TestBed } from '@angular/core/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrismaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
