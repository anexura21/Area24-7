import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {MuevetePage} from './muevete.page';

describe('MuevetePage', () => {
    let component: MuevetePage;
    let fixture: ComponentFixture<MuevetePage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MuevetePage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(MuevetePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
