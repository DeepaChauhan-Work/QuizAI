import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentLoginModalComponent } from './student-login-modal.component';

describe('StudentLoginModalComponent', () => {
  let component: StudentLoginModalComponent;
  let fixture: ComponentFixture<StudentLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLoginModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
