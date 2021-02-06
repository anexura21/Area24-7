import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AsombratePage } from './asombrate.page';

describe('AsombratePage', () => {
  let component: AsombratePage;
  let fixture: ComponentFixture<AsombratePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsombratePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AsombratePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
