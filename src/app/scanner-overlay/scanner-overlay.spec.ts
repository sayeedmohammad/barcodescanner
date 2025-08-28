import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerOverlay } from './scanner-overlay';

describe('ScannerOverlay', () => {
  let component: ScannerOverlay;
  let fixture: ComponentFixture<ScannerOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
