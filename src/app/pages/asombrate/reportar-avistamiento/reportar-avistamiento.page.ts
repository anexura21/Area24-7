import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { ActionSheetController } from "@ionic/angular";
import { Especie } from "src/app/entities/especie";
import { EspecieSugeridaIA } from "src/app/entities/especieSugeridaIA";
import { SlideOps } from "src/app/entities/SlideOps";
import { AsombrateService } from "src/app/providers/asombrate.service";
import { LocationUpdateService } from "src/app/providers/location-update.service";
import { Common } from "src/app/shared/utilidades/common.service";

@Component({
  selector: "app-reportar-avistamiento",
  templateUrl: "./reportar-avistamiento.page.html",
  styleUrls: ["./reportar-avistamiento.page.scss"],
  providers: [AsombrateService, Common],
})
export class ReportarAvistamientoPage {
  image: string;
  slideOps: SlideOps;
  formRegistro: FormGroup;
  idImagenes: number = 0;
  especie: Especie;
  especieSugeridaIA: EspecieSugeridaIA;
  peticionesServicios: boolean = false;

  dataImage: {
    id: number;
    url: string;
  }[] = [];

  constructor(
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    private asombrateService: AsombrateService,
    private locationUpdate: LocationUpdateService,
    private common: Common
  ) {
    this.construirVariables();
    this.contruirFormulario();
  }

  construirVariables() {
    this.slideOps = {
      initialSlide: 0,
      spaceBetween: 15,
      slidesPerView: 4,
    };

    this.dataImage = [
      {
        id: 1,
        url: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxASEhIPEhIVFRAVFRAQEBAVEBUVFRUQFRUWFhUVFRUYHSggGBomGxUVITEhJSkrLi4uFx8zODMvNygtLisBCgoKDg0OGxAQGi0fHiUtLS0tKy8tLS0rLS0tLS0tLS0rLSstKy0tLS0tLS0tLSstLS0tLS0tLS0tLS4tLS0tLf/AABEIAMIBAwMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAABAgUGB//EAD8QAAEDAgQCCAMHAwIGAwAAAAEAAhEDIQQSMUFRYQUTIjJxgZGxQqHBBhRS0eHw8SNignLCM0NTc5LiFRYk/8QAGgEAAgMBAQAAAAAAAAAAAAAAAQIAAwQFBv/EAC4RAAICAQQBAgQEBwAAAAAAAAABAhEDBBIhMUETUSJCYYEFMqHRFHGxweHw8f/aAAwDAQACEQMRAD8A9YXqs6GSsyuS2VWae5YaVRKoJbDYw1yK16VDloPRsZMZLlprkt1ivOimNYzmVtclusWw9MGxoPU6xKl6mZQO4ca5FY5KMeiseo2MmPMciykmPRRUS2NZHlBcVp70Fz1LBZHFLvW3OQnFGwWUCtoQK1KayIICoXIRcqzKBDhyIHJUPW2vRINByK1yUDkRr0oyY1KsILXorSgwphAERqECtgqDBVSqVFCHmWqiFAVZKrOeDcsStOWCEtkIXqusWXBCKhLD9atColJV5kyGsa6xabUSgK20pw2N51sPSgctZ1LBY6yojMeuWKiOyolbDuOk16MHrnsqJhr0tjbg7nITlhz0vWrmcrR2iNTp7apJ5IwW6Q0bk6QZzvzuVTHt3Ai980CLRZLdWYGax7JcYubXBlp56pk4d3Fx8D72XHz/AIjKTqLpG/Hgiu+Rpj2TZo42HE8bphuJYBdoPkPey4VSnUGhmNrE+YlL4npdtKBVLWz3cxEmNYkX8uKyqeSbqLbZp2Qrng9K40XCSwbaQD6hIYjDjWmZH4Tr5RquI/pprm52lrm8Rl+lkTA9JBxsfI8JF4VmHNqcErbdew38JjnG0xsVERj1jEBsCo0gsJIJboKg1a78Lt45oIcvTxbaTaqzky4dDoctB6VD1sOTAsda9EY5KMcjMelDY61y2ClG1FrrFA2OZlEn1iigxwsymZDDlYVLOfZqVCVgq0KDZTihuC2VkqEF3KAq3rKhDbUQFCYUQBMiWbChKpUjYCwiU3LLWrQCVgDtcmG1EoEahBOo4luYAxffyOyrnNQVyHhGUuisZigxpcb6AAbkkQFy8Ji7GTcnMZnXw3TPSWFJcDe0QHGBEmbeG6UoYcAmTG4tuNIXM1GeOVV4OhhxOHfZ1sM/PaxJ0tedpjkn6XR51c4c2htwDzlI0cTkbMaG75jjtv5Lo0K7SAc3Z1mZFxw3XJmpfL0a0wdXDUmEy4jk55FtNT5LxX246Frlza2Gc+QzI4B4uBoQTYm+k3uveV2scC49oblxB/jwXJLHtIDHW2ZEt1uFo0WqlgyepDte/Q0oLJGmeL+yfRmJpF76n4gHCzpJFwcvZkyCfzXWr1GUndkRJkACTEi4AvC9BUZWdqQ0cbu56aRf5JB9enTeQGEuPBoN5mSTqdb7aQugtTHU592Tr6f3E2SxwqIvT+0LGuJAGVxzvpvAGcugE8zA118k2zH0ahmmYnVmYEjkD8Q+YSuLpmqQ4NaIIMvAdaNIE8eKAOjswAqFph7ng02dWYMdkkd6CNxPAjf0UM2OcdrXHg501TuzsBy0HJdpW2lU2JuGW1EZj0oCjMKlgTGmvWs6C1bAQHTNZ1FWVWiOcEORGuSfWLbXqkwoaVlBa5EaUaCQqwFtrFstQYyQs9qC8JxwS9RqQNAWlFa5CyrYToUJKuUKVYRAMMKt0wSAXRchokoNN4ktEki5ABMDmdB5kaFHLTEZSQ42LrkgQJbTAsI3I/MZ82fZwuy/Fh3cvolHDl9x32xGj2g82AwD4gxyTeHbksTc6tDOz4WAy/5LNGgWkSDwYDU25U2COHDVdNlECJacx+FrADE/EZIF/YrjZZ5Jv3NyUYqkJmgH3gAaSGi3AwJB+aVr4eDYGYLpaAfPW/8AK9A+owEXvAMWJPy0FkFzaVQCBlM92CCTxtodFmanHlrgZSR5xvIknnYeWb2QKWLySxwBp6g2kHa4C7WK6Nf46aE6AaHVI1aQHeub7b87W2+SeGReORw9LGkiGN5SBYbb90IrCc15A2mfluSb3SdCmYPVOLdiMwjmRNv1TNKnUcMkiJ43jmfrqkmo/wAiyLozj8Z8LdYvw3sQuSHSZ/fC/wC9ymcY3I3Lx3vpy/e6UYunoNPFLeY9XqHe1Bw5aAWWBEhddM5+4gRGLACIE1gs01MUwgNCbpBBFiCsaiQrY1bLE1liB5VSLlUTFlnjZW2OQgttCoTMIdrkem9KtR6aNhH6ajlmnorcUoyMOCG9qKpClDCjwqajVAsNCZIDJlQa1YNjW5cxp3c8WDaU94zq7ujjKO9jpyi7rjIO8Tvm/CAJnflscNwZa4uc4VMSeyXR/TpNNgxoB2vYefBVTzxTLsWHzIYw1KoG5GANpGIm7nutLiLQ21uNjbZungmDQZnugZiSXHeTOjYvFvZJ1cdlzZXZiNTAiRo1scPRKO6VdEA6k9qe84xJby/IHgsMk5v2Rpujs4jHsonK2OsPae6bgQDrvMgcoSv/AMq4OsSTryAggN9lxAzMS4m5NyTfy+f7KJQrNIJaRMwRw3vwNygo7V8Ksj+p1jiJ7TiS+PxZYG4AGvmmsNjSS1jGuNw0QLNGpJvbx/hcBjJknnPgD9V6XoHCCkwvdd7uJJgWmGzrz19lRqJxhB2+SRi2zruqbGOFo+QS9V9M9lwEiR+iGzEQJiYsRb+fVa60m4aPEbDzXF2uzUhTE9HNIJbMkEQNwdAeSHSpPBa03giDFoBv43XUpAxHof5QSCDyNwdxG6KnLpj8HK+0AtTEz3j8gFymBP8ATVQlzG8AT4ybeyTphen/AA+LWnjf+8nH1TvIwzQtgKMC05bqMplWCslUxEZDTAnaLUgxy6GHKhbEYDURrVkIzExaZyKImZRSxrPAgIjQtZVprVnMZA1HotWAEVilhGWqyVhpVqELUdZZLlh9RWIawbis1MTlOVjDUrQHBrdGtOhe7RpMWGtiYkBc3G4yk49UapY7U0mEdZkGpqv/AOWDfsjtGbxdq5GK6aqEfdsKxtNujnsHajg0/CLDS547JnBtUv8ABfjxvtnpmYlzT/VNNjyJ6tpkiZGusW314kodYmp2WWZEEixI5HadzzXA6Pw4wrHVKrwASDe5e/QRefP2WG9NVqroZFOkOQ7vFx8It5LJLBbuL+/g0XXZ362CnsDQC8Wty5LDcLNo8BaAN7ris6VfJcHHqmwJNy47+ugWj0vXMMEZzcnXI381XLT5fDIpI6TWu6wfhbP/AJEW9z9EqML2nX08pf8AkPcpd/ST9WjtGcp/E7d0bBT7y9wy7aOI1c86gJl6kPYnDO50EzPUDTdoOZztJj4QRYTueVrkL1GOrgQJA/tBjyA1XlujqnUsm2Zw12a3ktfeHPOpA+nHnx4LlamPqZL8IuhwjsUqhLo0HGNl0GVW2a0k6CT/AAuGKgbBGvidfGJhPYOsN7m+405cljy41XBZFnWdIIO15koDsQe1/aPkpWxBHZ3ME8uCVxT8rST3yPew9/mqseOUml7hlJRVnLxj8zyddGzyaIWGBWrAXr8cFGKivBxJy3SbDUwtkLLCtSrkVgnBQLblkNQbCglMLoUTZJMEJmm9JZYmOU3I4ck2uROsRsfcMZ1SV6xRSw7jzhatQrIUhI0UlBbaVkBaSMgRpWg5CCy58SSYAkkzYAbqJhQUn6nyAkmfAH0XjelulqmLccPhSRRFqlYS01DOjDqGc9XTsIlrpXE/eBFR/U4MmIdZ9cTqW6hljDd4BN7AWFqVKkswzTRojWqbPcP9u/O6uT2q/wDi/dmnHjrll4Podzf6NOxMCs+B2GCOyBxMj1vqi9IYqhhWGnSAdVd2ZGrSdTP4uHrsmaVEU2OZTJNiXEk3Ph9PVcuh0drVqkTexNgOH6rP6ylK5O0v1NFCT6FSs7rKugsxo7rGAQGtGwEDxRqjZHVtMUhd5jvfpPqnW0C8CGuymcvZPbi9tyPCfmsVKHmG63GRsfjf3Qf7ZnkmeW2ChQkdmB/22f7j+9kVtPKIJknvHc8h+7KUSCew01H7ughvKLfKF06PR1TUgNPGCT4AbKvJmUe2FREmUSbmxMAnSBHdbzv9U5hWCQGtJi3ARvHLZdGn0UwCSS53hHoNkZuH2DCB5SsGTVKXRaoUBLMxlxvwGgHsmaLMwgaDc/TioxgFoHgfqjZo3j0Hosu+x6NVmhkACeX70UZLROhNzyA5IQqzt4Tv4KoJvMDdJy0ShpmKvqYuf3zQsTiS8yljyVAro6XTqHxtcnO1Oo3fDHoYBVgoIK2CukpGMYarJWGlXKs3BICj02odNqZa1K2AyQttUc1EZTSWCyBy0HqzSQniE1jqRovUQcypQO456hWJWmlGw0QK1cIVaqGgucQGi5cTAA5pWrDRZcvL9L/alpJoYdvWvmC6+S2gH4pNrcOYSvS/TNbFF2HwwLad2vqaF43v8LfzuUz0ThKOFbmEGqYAfIEnV2Sb2tLotMC6LjHGrly/b9zRix82XgOhiT94xjy6oSHCn8miPhEQABrbxXaLrQRlYPhsL7AnjyF0g3EPJnLJ4mQPLcCPM7lFc6sRMtBvlGXbzXPzZHN/EzUkHc8xDQAPxPbAn+2nYk+JB5JWriKLTJdneLy65adbMaLeYaf7lysWyq4w95I3E29Br5omFwTBvAHkAnjsirByPVMWXzmMNPezkmfGmLO/zL1plWmTLqbqkaPcDA/0j4RyCLhm0WXnN4j8x7Lq0OkANGh3yPqqpZLXCf8AQNF9HVnOsynlA37o+cH5LrU6gbrBPGAD73XNPTNXSAP8ggHEk6n6+wAHzWKcN3fA6OtWxZNhlCUr1BFzflIST6xOn7/JCe6NfO6q9JXwOrCh429TxVF8n01VspPdoLcTYI9LCR3jJ4CwWnHppy5ornmhHtmKY4eq05GI5IT1uxaSMOXyzDl1Ep8LhGAFZVKwFo2mRoythXlUARCGaFtrVVIorQmslBKYTDAgMTDFLAzeVaCyrlShaLc5LVCtPegucmoNFKKSoiQ5lMI4asUgjiPeTwG5QNCQJy8p9rMJXfUY2ZpgBwpNJFz8T+fDW3ivaUqLzD4yMiQ9wEkfiYw2j+93ZHBy5WMqNc4imHOM9p5k+pOvHQeEKiWq2yqHJox4q5Z5TBYfEAhrYY3RzGsGUjfMTc+ZXXZgwIc65gAExYDYcBc+pT7MK/chvLUqjhG8yqprNl+hbvigEc1gC5iSdzBKcbRaNvqtiyWOka7Fef2RzG0RMlrieNlMTh25TAM66x7LqtV9WCmWBp8A9YRw+GZkzl1okds+0rGHw7nSZcZJgSYA8vJNDBhri6MzTcsmCBuAeGvryC6WFb2BkzOY0RpJYBZuaNWwLO9VetA3FtSsLzOricTF5KUGoXDNOWxJMRPuNVeAy1TDM2mp/krrdJYJtam6mbHVp4O2P58lwejalTCuiqwhpETt/ifL0SrQxfTBHM5R+p3aPR40cT5Julh2N0aPE3PqfoqoVmvEtII0tx8FuFbHBHH4KJZJvssob1shYKeisGUJwRSpClAAZVpoWy1QBGhSKBaK0Aq2iGWo9NDAW2pQBWphhS7URpUBQyCFTyhBygcmslAnob0V5QHvTWHaYL1SvMFSm4NFUqRJDQJJ0A1RMTkpEZoqVJByC7GusR/rd6gcN1ipjh/w6An8TyNRxJ2H9oWKdCLm7t3H2A2Coe7K+OI/qa0lDvsqoXVCXVCTN8s2ni69yihoiNuCpXKtjjjBUkI5NgntS7gmXFDcFckRAA1U5qMsOR22GjAW2hZC2HIbCNF5lTHlrhUYYePny8OSw9JVukWBxpgzUEEjYTEAnY3CshF3wRKnwdym5tQTTEOEl9LhzYNxy22shuDXAtIBadQbg+KQY4ObnpvDiJgsJztOxyC51PdnTyTTcVnbmIHWC1RoEWE9ogwAZttJBV8sLlzXIZJPlCn3B1Il9A2MZqZ3A4HfwKfwOOZUt3am7HWuNgpTdKrF4FtW/dqDu1BqD9VRfiQNyfEhpwKyWrkU+latB3VYlpIDew9sHMJ1bNze0Tq7ZdPDY6m9odmDeILhY3tOmxUniaVrlFUo10RzUMhOFqA9qobFMBayqmogKXcBmMq00KEqghYDSgVhq21iFEI0rYWYWmIENgKQtBRCyAnBBc1NOahOapYbA5VEWFERhSkA0QNEYGUALTVp2js25YcVZQ3IUArMsucqKHUKaK5GsvOrBlLAk2AnnZG+5OMBzi24EQQ0SfiIBt5Lbj0s5LnhCSzxXHZdSs0akDlv6BAdjG7AnnoPz+S2cMxpuQJBuQTwueA5lZr1KLBrpYuAEX1IF1rjoYLt2UPUz8IC+vUNm5ON836LnnCuZmH/AFCX1DGYF2Yy3NFuQTzMbRsS506HvaXtJ4zN+CPiOlMzWsPcZBaC8wIi2UHRItMoytdFvrpxquTmYPBVqhDGOggGIDWwAJNwJ/lb6Fr1G4kU6pa8VA4iplhwqgdkPlsHR35qx0g1rS2xE5u7qYIgcu0f2FzukMTAuwtcMuW+4MzI0KXJCUclx6LcWSLhz2erx72OBLKrqb2ODKgIEAuDcphwlwIIM6+Rsu2pXaARWpv8Mhv5QTqPUeStV9N5pPeCGYijlM9puZkGSSTcBzdY7srz2U03ODTZhILRcAAkW4abFNsUuaT+wJpebPQdI061RzXvMFoLQG2Ak3JEm8x6BIVKbmB2ZuZsXaDoZkkA6b3BUodJOdZxzR3TMmNInU8L8E3Ux4cLxPLfyiPmrtkNqpUULJKLq7G8F0qMpa6pNszHhpAAAuMsAm0i3BM/eKzajabw17Hh72VWTGVtyYO0nL4jxXKoYRrmuzR1ZvAEySJMjgFXRGNdRL8K8l1Psua4uOZl41k6SLwZBuseXFF3FF6e5dcnezLedLF5DiwwSDlJB3HEFaD1zculy4/zL7+Cm0w8olMJUOTNJypSGSDgLYCEHIrUbIXlQ4R0JxVbYGQOK01yxK0oA2ShvChcl6lREKC5lEp1hUUGow0ozQgUijhy2schCw5qFiMSAcou6wjYTpKBTr1GuGfuneA20yIE6c1dj0sp89IrlNI6VDAl1zIHgZS78K11QlrcrRIJJIkDzt+iafXDRc3+Fu5FtDt+q5mPxVIDJqTBLAZuNATvfbmulh0/p8lMp2hqi5hMtyllxMkzNwPTZCxXSjRIEcBrO4489V5/FdKySCC0AnsZgTMwSfRc6pjxw45jqTpG3I2PFWvLQFjv6HTxmLpulxa6LEkHSNOepGiTfXpM7U63i8FuxP72XOfjiS6wM8b8EucQyZIvBBNvLwVU8pYsZ26lUEFzMjbW0zeW59wuZVxJtLp2gLFHCYmp3aZjcxlF+Z1TVP7OVzqWDxcT6wFl9au2XOMRKpiIIIE6G5jyjcIVbHvfObhAGw8F2WfZZ3xVQP8ASwn3IRP/AKrP/OtEf8L/AN1X6y9xuAeG6SH3WkwfBUpMgiDmfIeAeGVw9AbJHpkZKrp0cA8eDv1BXapfZN/Y/rMLWEODTScATu4nMTmsPQbJfE9AYjEPIaWTRc7DucXECbO7MC4GYeaaOdIEmmjhtrRf5/P6FM0sXBDt+M6JrE/ZbGU+0GB9rlhDufdN9eS4bw4HIQQQYg2I5RturVmTE2rwd+jj6gcQCBqANbSAqrVx1jS8Qc02MACw20FtL7rkUn5Zn2lNsqNIIkXve3rzQWRXwN6b7PR4TFtDWuPeOpB25jwhdajUpviSM1gAHgPJM/DM6j5LwtOuRobXi2hTWH6QcCCQD4q5TbVIqcFds9i8ESNY8AT5FFpu2K8/humL9oX0knW86+ZXawuJbUAIuY228eNgFRn0cZ/FDh+wITriQ+wo7XJCnURm1FxskXB00WDbnoJch5pVKhsVhQ5aDkAFGYmTAWQhOYmApkTJAsSyKJzq1SsG3HMp7IzzZ3gfZRRa1+ZFjOf0bepTn8Q9wmHGdb3Ot+Cii7xk8M5/Trj95cJMdsROw09Fw8fVcCIJGuhOxbCiiWXkkQ3S5/rzvBPycuJV3UUWaXZoXQJmrebwD4WX0WlhabWjKxrdNGAbclFFjzj+DR/P3WX7qKLKLIgWqaiiBEMtNj4H2KF9mR/+TDnd1Km9x3L3Zi5x4km5O6iiPyis6g+qXxlBj2OD2tcL2c0OGg4qKJ8YF2fKscwCq9oADQbACB6IVT9/NRRXrs1/KEp6O8FZNyootESmR0KB7Hp9V1OjSYne91FFqh4M0+j0mG7p/ewW2qKLk/ingsj0bat7qKLjsj7IEYKKJ4gCNRmqKK1ERSiiicB//9k=`,
      },
      {
        id: 2,
        url: `data:image/jpeg;base64,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`,
      },
    ];
  }

  contruirFormulario() {
    this.formRegistro = this.formBuilder.group({
      nombreComun: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
      nombreCientifico: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
      descripcion: new FormControl(
        "",
        Validators.compose([Validators.required])
      ),
    });
  }

  takePicture(pictureSourceTypeCustom: string) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 500,
      targetHeight: 500,
      sourceType:
        pictureSourceTypeCustom === "CAMERA"
          ? this.camera.PictureSourceType.CAMERA
          : this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        let image = {
          id: this.idImagenes++,
          url: `data:image/jpeg;base64,${imageData}`,
        };

        this.consultarIASugerenciaEspecie(imageData);

        if (this.dataImage.length <= 10) {
          this.dataImage.push(image);
        }
      },
      (error) => {
        console.error("takePicture", error);
      }
    );
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: "Elija el origen de la imagen",
      cssClass: "center-align-buttons",
      buttons: [
        {
          text: "Selecciona de la galería",
          handler: () => {
            this.takePicture("PHOTOLIBRARY");
          },
        },
        {
          text: "Tomar una fotografía",
          handler: () => {
            this.takePicture("CAMERA");
          },
        },
      ],
    });
    await actionSheet.present();
  }

  borrarImagen(idImagen): void {
    this.dataImage = this.dataImage.filter((elem) => elem.id !== idImagen);
    if (this.dataImage.length === 0) {
      this.borrarDatosVariables();
    }
  }

  borrarDatosVariables(): void {
    this.formRegistro.reset();
    this.especieSugeridaIA = null;
  }

  seleccionarEspecieIA(especieSeleccionada: EspecieSugeridaIA) {
    this.formRegistro
      .get("nombreComun")
      .setValue(especieSeleccionada.Imagen.NombreComun);
    this.formRegistro
      .get("nombreCientifico")
      .setValue(especieSeleccionada.Imagen.NombreCientifico);
    this.formRegistro
      .get("descripcion")
      .setValue(especieSeleccionada.Imagen.Descripcion);
  }

  consultarIASugerenciaEspecie(imageData): void {
    this.peticionesServicios = true;
    const parametrosServicio = {
      Imagenes: [
        {
          Foto: imageData,
          NombreArchivo: "",
          NombreComun: "",
          NombreCientifico: "",
          Descripcion: "",
        },
      ],
    };

    this.asombrateService
      .obtenerSugerenciaAvistamiento(parametrosServicio)
      .subscribe((response: EspecieSugeridaIA) => {
        this.especieSugeridaIA = response;
        this.peticionesServicios = false;
      });
  }

  async guardarRegistro(formulario: Especie) {
    const especieSeleccionada: Especie = {
      nombreComun: formulario.nombreComun,
      nombreCientifico: formulario.nombreCientifico,
      descripcion: formulario.descripcion,
    };

    const geoposition: {
      lat: number;
      lng: number;
    } = await this.locationUpdate.getCurrentGeoposition();

    let idAvistamientoCustom = 0;

    if (this.dataImage.length > 1) {
      this.asombrateService
        .guardarReporteAvistamiento(
          especieSeleccionada,
          this.dataImage[0],
          geoposition,
          null
        )
        .subscribe(
          (response) => {
            this.borrarDatosVariables();
            idAvistamientoCustom = response;
            this.dataImage.forEach((value, index) => {
              if (index !== 0) {
                this.asombrateService
                  .guardarReporteAvistamiento(
                    especieSeleccionada,
                    value,
                    geoposition,
                    idAvistamientoCustom
                  )
                  .subscribe(
                    (response) => {
                      this.borrarDatosVariables();

                      this.common.appToast({
                        mensaje: "Avistamiento registrado exitosamente",
                        duration: 2000,
                        posicion: "bottom",
                      });
                    },
                    (error) => {
                      this.common.appToast({
                        mensaje:
                          "Error al guardar el avistamiento, por favor intenta de nuevo.",
                        duration: 2000,
                        posicion: "bottom",
                      });
                      console.error(error);
                    }
                  );
              }
            });
          },
          (error) => {
            this.common.appToast({
              mensaje:
                "Error al guardar el avistamiento, por favor intenta de nuevo.",
              duration: 2000,
              posicion: "bottom",
            });
            console.error(error);
          }
        );
    } else {
      this.asombrateService
        .guardarReporteAvistamiento(
          especieSeleccionada,
          this.dataImage[0],
          geoposition,
          null
        )
        .subscribe(
          (response) => {
            this.borrarDatosVariables();
            this.common.appToast({
              mensaje: "Avistamiento registrado exitosamente",
              duration: 2000,
              posicion: "bottom",
            });
          },
          (error) => {
            this.common.appToast({
              mensaje:
                "Error al guardar el avistamiento, por favor intenta de nuevo.",
              duration: 2000,
              posicion: "bottom",
            });
            console.error(error);
          }
        );
    }
  }
}
