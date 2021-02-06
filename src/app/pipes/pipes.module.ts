import { NgModule } from '@angular/core';
import { CapitalizePipe } from './capitalize.pipe';
import { SanitizeimagesPipe } from './sanitizeimages.pipe';
@NgModule({
  declarations: [CapitalizePipe, SanitizeimagesPipe],
  imports: [],
  exports: [CapitalizePipe]
})
export class PipesModule {}
