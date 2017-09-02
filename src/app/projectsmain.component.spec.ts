import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsmainComponent } from './projectsmain.component';

describe('ProjectsmainComponent', () => {
  let component: ProjectsmainComponent;
  let fixture: ComponentFixture<ProjectsmainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsmainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsmainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
