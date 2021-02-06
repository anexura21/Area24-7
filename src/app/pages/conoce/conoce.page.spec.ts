import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConocePage } from './conoce.page';

describe('ConocePage', () => {
  let component: ConocePage;
  let fixture: ComponentFixture<ConocePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConocePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConocePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
