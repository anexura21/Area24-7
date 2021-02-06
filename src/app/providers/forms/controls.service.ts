import { Injectable } from '@angular/core';
import { CheckboxControl } from '../../entities/forms/checkbox.control';
import { DatatimeControl } from '../../entities/forms/datetime.control';
import { LabelControl } from '../../entities/forms/label.control';
import { NumberControl } from '../../entities/forms/number.control';
import { RadioControl } from '../../entities/forms/radio.control';
import { SelectControl } from '../../entities/forms/select.control';
import { TextareaControl } from '../../entities/forms/textarea.control';
import { TextboxControl } from '../../entities/forms/textbox.control';

@Injectable({
  providedIn: 'root'
})
export class ControlsService {

  constructor() { }

  getControls(descriptors: any[]) {
    const controls = descriptors.map((descriptor, index) => {
      const options = {
        ...descriptor,
        type: descriptor.type,
        key: descriptor.name,
        label: descriptor.title,
        placeholder: descriptor.placeholder,
        value: '',
        image: descriptor.image,
        required: descriptor.required,
        order: index,
        selected: descriptor.selected,
        multiple: descriptor.multiple
      };

// Se mapea el tipo de pregunta que llega y se envia a construir el componente
      switch (descriptor.type) {
        case 'Selección mútiple':
          return new CheckboxControl(options);
        case 'Selección múltiple':
          return new CheckboxControl(options);
        case 'Texto':
          return new TextboxControl(options);
        case 'textarea':
          return new TextareaControl(options);
        case 'Lista':
          return new SelectControl(options);
        case 'Numero':
          return new SelectControl(options);
        case 'Booleana':
          return new SelectControl(options);
        case 'Número':
          options.min = descriptor.start;
          options.max = descriptor.end;
          return new NumberControl(options);
        case 'Checkbox':
          return new CheckboxControl(options);
        case 'Etiqueta':
          return new LabelControl(options);
        case 'Fecha':
          return new DatatimeControl(options);
        case 'Radiobutton':
          return new RadioControl(options);
        case 'Calificación':
          return new LabelControl(options);
        case 'Selección simple':
          return new RadioControl(options);
        default:
          console.error(`${descriptor.type} is not supported`);
      }
    });

    return controls.filter(x => !!x).sort((a, b) => a.order - b.order);
  }
}
