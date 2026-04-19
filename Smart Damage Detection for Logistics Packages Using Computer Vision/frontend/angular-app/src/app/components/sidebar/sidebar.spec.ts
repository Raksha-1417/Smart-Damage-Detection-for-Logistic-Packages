import { ComponentFixture, TestBed } from '@angular/core/testing';

import { sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: sidebar;
  let fixture: ComponentFixture<sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [sidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
