import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MidetePage } from './midete.page';

describe('MidetePage', () => {
  let component: MidetePage;
  let fixture: ComponentFixture<MidetePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MidetePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MidetePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
