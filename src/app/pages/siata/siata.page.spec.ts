import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SiataPage } from './siata.page';

describe('SiataPage', () => {
  let component: SiataPage;
  let fixture: ComponentFixture<SiataPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiataPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SiataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
