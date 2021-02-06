import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportarAvistamientoPage } from './reportar-avistamiento.page';

describe('ReportarAvistamientoPage', () => {
  let component: ReportarAvistamientoPage;
  let fixture: ComponentFixture<ReportarAvistamientoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportarAvistamientoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportarAvistamientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
