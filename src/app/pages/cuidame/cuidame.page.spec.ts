import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CuidamePage } from './cuidame.page';

describe('CuidamePage', () => {
  let component: CuidamePage;
  let fixture: ComponentFixture<CuidamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuidamePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CuidamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
