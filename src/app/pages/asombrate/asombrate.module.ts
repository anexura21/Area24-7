import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { AsombratePageRoutingModule } from "./asombrate-routing.module";
import { AsombratePage } from "./asombrate.page";
import { Camera } from "@ionic-native/camera/ngx";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AsombratePageRoutingModule],
  declarations: [AsombratePage],
  providers: [Camera],
})
export class AsombratePageModule {}
