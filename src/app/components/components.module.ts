import { HorariosEnciclaModalComponent } from './horarios-encicla-modal/horarios-encicla-modal.component';
import { DetalleRutaComponent } from './detalle-ruta/detalle-ruta.component';
import { AutocompletadoLineasRutasComponent } from './autocompletado-lineas-rutas/autocompletado-lineas-rutas.component';
import { DetalleRutasCercanasComponent } from './detalle-rutas-cercanas/detalle-rutas-cercanas.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { MenuFavoritoPopoverComponent } from './menu-favorito-popover/menu-favorito-popover.component';
import { SeleccionarMapaComponent } from './seleccionar-mapa/seleccionar-mapa.component';
import { BuscarUbicacionComponent } from './buscar-ubicacion/buscar-ubicacion.component';
import { EstablecerUbicacionComponent } from './establecer-ubicacion/establecer-ubicacion.component';
import { InformationComponent } from './information/information.component';
import { PolicyComponent } from './policy/policy.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { OnlyNumbersDirective } from './../directives/only-numbers.directive';
import { PerfilComponent } from './perfil/perfil.component';
import { RegistroComponent } from './registro/registro.component';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones.component';
import { MidemeModalPersonalChallengeComponent } from './mideme-modal-personal-challenge/mideme-modal-personal-challenge.component';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DetallePosconsumoComponent } from './detalle-posconsumo/detalle-posconsumo.component';
import { UbicacionesFavoritasComponent } from './ubicaciones-favoritas/ubicaciones-favoritas.component';
import { MenuModalComponent } from './menu-modal/menu-modal.component';
import { CheckboxModosTransportesComponent } from './checkbox-modos-transportes/checkbox-modos-transportes.component';
import { MidemeModalCheckChallengeComponent } from './mideme-modal-check-challenge/mideme-modal-check-challenge.component';
import { MidemeModalCalculationSaveComponent } from './mideme-modal-calculation-save/mideme-modal-calculation-save.component';
import { MidemeModalSelectChallengeComponent } from './mideme-modal-select-challenge/mideme-modal-select-challenge.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { CuidameSelectUbicationComponent } from './cuidame-select-ubication/cuidame-select-ubication.component';
import { CommentComponent } from './comment/comment.component';
import { CuidameDetailComponent } from './cuidame-detail/cuidame-detail.component';
import { BarraNavegabilidadComponent } from './core/barra-navegabilidad/barra-navegabilidad.component';
import { TerritorioDetailComponent } from './territorio-detail/territorio-detail.component';
import { FichaCaracterizacionComponent } from './ficha-caracterizacion/ficha-caracterizacion.component';
import { DetalleEstacionComponent } from './detalle-estacion/detalle-estacion.component';
import { ClimaDetalleComponent } from './clima-detalle/clima-detalle.component';
import { EmprendeEcoComponent } from './emprende-eco/emprende-eco.component';
import { InformateComponent } from './informate/informate.component';
import { HuellasComponent } from './huellas/huellas.component';
import { AvistamientoComponent } from './avistamiento/avistamiento.component';
import { VigiaComponent } from './vigia/vigia.component';
import { MovilidadComponent } from './movilidad/movilidad.component';
import { MixedTypeaheadComponent } from './mixed-typeahead/mixed-typeahead.component';
import { MiEntornoComponent } from './mi-entorno/mi-entorno.component';
import { MyLocationComponent } from './my-location/my-location.component';
import { OtherLayerComponent } from './other-layer/other-layer.component';
import { FusionLayerComponent } from './fusion-layer/fusion-layer.component';
import { MapaComponent } from './mapa/mapa.component';
import { GeneralConfigurationComponent } from './general-configuration/general-configuration.component';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerComponent } from './layer/layer.component';
import { LayerManagerComponent } from './layer-manager/layer-manager.component';
import { GeoLayerComponent } from './geo-layer/geo-layer.component';
import { GeoLayerStaticComponent } from './geo-layer-static/geo-layer-static.component';
import { GeoLayerDynamicComponent } from './geo-layer-dynamic/geo-layer-dynamic.component';
import { TerritorioComponent } from './territorio/territorio.component';
import { PipesModule } from './../pipes/pipes.module';
import { DecisionTreeComponent } from './decision-tree/decision-tree.component';
import { MapSelectLocationComponent } from './map-select-location/map-select-location.component';
import { EncuestaModalComponent } from './encuesta-modal/encuesta-modal.component';
import { MidemeModalChangeChallengeComponent } from './mideme-modal-change-challenge/mideme-modal-change-challenge.component';

@NgModule({
  declarations: [
    GeneralConfigurationComponent,
    MapaComponent,
    FusionLayerComponent,
    LayerComponent,
    LayerManagerComponent,
    OtherLayerComponent,
    GeoLayerComponent,
    GeoLayerStaticComponent,
    MyLocationComponent,
    MiEntornoComponent,
    MixedTypeaheadComponent,
    MovilidadComponent,
    GeoLayerDynamicComponent,
    VigiaComponent,
    AvistamientoComponent,
    TerritorioComponent,
    HuellasComponent,
    InformateComponent,
    EmprendeEcoComponent,
    ClimaDetalleComponent,
    DetalleEstacionComponent,
    DecisionTreeComponent,
    FichaCaracterizacionComponent,
    TerritorioDetailComponent,
    BarraNavegabilidadComponent,
    CuidameDetailComponent,
    CuidameSelectUbicationComponent,
    MapSelectLocationComponent,
    DynamicFormComponent,
    MidemeModalSelectChallengeComponent,
    MidemeModalCalculationSaveComponent,
    EncuestaModalComponent,
    MidemeModalCheckChallengeComponent,
    CheckboxModosTransportesComponent,
    MenuModalComponent,
    UbicacionesFavoritasComponent,
    DetallePosconsumoComponent,
    MidemeModalChangeChallengeComponent,
    MidemeModalPersonalChallengeComponent,
    TerminosCondicionesComponent,
    RegistroComponent,
    PerfilComponent,
    OnlyNumbersDirective,
    UpdatePasswordComponent,
    PolicyComponent,
    InformationComponent,
    EstablecerUbicacionComponent,
    BuscarUbicacionComponent,
    SeleccionarMapaComponent,
    MenuFavoritoPopoverComponent,
    SideMenuComponent,
    DetalleRutasCercanasComponent,
    DetalleRutaComponent,
    AutocompletadoLineasRutasComponent,
    HorariosEnciclaModalComponent
  ],
  exports: [
    GeneralConfigurationComponent,
    MapaComponent,
    FusionLayerComponent,
    LayerComponent,
    LayerManagerComponent,
    OtherLayerComponent,
    GeoLayerComponent,
    GeoLayerStaticComponent,
    MyLocationComponent,
    MiEntornoComponent,
    MixedTypeaheadComponent,
    MovilidadComponent,
    GeoLayerDynamicComponent,
    VigiaComponent,
    AvistamientoComponent,
    TerritorioComponent,
    HuellasComponent,
    InformateComponent,
    EmprendeEcoComponent,
    ClimaDetalleComponent,
    DetalleEstacionComponent,
    DecisionTreeComponent,
    FichaCaracterizacionComponent,
    TerritorioDetailComponent,
    BarraNavegabilidadComponent,
    CuidameDetailComponent,
    CuidameSelectUbicationComponent,
    MapSelectLocationComponent,
    DynamicFormComponent,
    MidemeModalSelectChallengeComponent,
    MidemeModalCalculationSaveComponent,
    EncuestaModalComponent,
    MidemeModalCheckChallengeComponent,
    CheckboxModosTransportesComponent,
    MenuModalComponent,
    UbicacionesFavoritasComponent,
    DetallePosconsumoComponent,
    MidemeModalChangeChallengeComponent,
    MidemeModalPersonalChallengeComponent,
    TerminosCondicionesComponent,
    RegistroComponent,
    PerfilComponent,
    UpdatePasswordComponent,
    PolicyComponent,
    InformationComponent,
    EstablecerUbicacionComponent,
    BuscarUbicacionComponent,
    SeleccionarMapaComponent,
    MenuFavoritoPopoverComponent,
    SideMenuComponent,
    DetalleRutasCercanasComponent,
    DetalleRutaComponent,
    AutocompletadoLineasRutasComponent,
    HorariosEnciclaModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ComponentsModule { }
