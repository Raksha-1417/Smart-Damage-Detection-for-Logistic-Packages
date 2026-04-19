import { ComponentFixture, TestBed } from '@angular/core/testing';

import { topbar } from './topbar';

describe('Topbar', () => {
  let component: topbar;
  let fixture: ComponentFixture<topbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [topbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(topbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
