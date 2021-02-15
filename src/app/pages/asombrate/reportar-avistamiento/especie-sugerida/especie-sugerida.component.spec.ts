import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EspecieSugeridaComponent } from './especie-sugerida.component';

describe('EspecieSugeridaComponent', () => {
  let component: EspecieSugeridaComponent;
  let fixture: ComponentFixture<EspecieSugeridaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EspecieSugeridaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EspecieSugeridaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
