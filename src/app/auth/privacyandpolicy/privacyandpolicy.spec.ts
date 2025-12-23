import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Privacyandpolicy } from './privacyandpolicy';

describe('Privacyandpolicy', () => {
  let component: Privacyandpolicy;
  let fixture: ComponentFixture<Privacyandpolicy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacyandpolicy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privacyandpolicy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
