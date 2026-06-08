import { Component, computed, effect, input } from '@angular/core'
import { Option } from '../../model/options.model'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Field, FieldTree, FormField } from '@angular/forms/signals'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { YamlEditorComponent } from '../yaml-editor/yaml-editor.component'

@Component({
  selector: 'app-option-edit',
  imports: [
    MatTooltipModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormField,
    YamlEditorComponent,
  ],
  templateUrl: './option-edit.component.html',
  styleUrl: './option-edit.component.scss',
  standalone: true,
})
export class OptionEditComponent {
  readonly option = input.required<Option>()
  readonly form = input.required<FieldTree<unknown>>()

  protected readonly textChoiceValueType = computed(() =>
    typeof this.option().default === 'number' ? 'number' : 'text',
  )

  constructor() {
    // the preset names are also accepted as values, but we immediately map them to the proper value equivalent
    effect(() => {
      const option = this.option()
      const value = this.form()().value()
      switch (option.type) {
        case 'TextChoice':
        case 'Choice':
          if (!option.choices.some(c => c.value === value)) {
            const preset = option.choices.find(p => p.name === value || p.display_name === value)
            if (preset !== undefined) this.form()().value.set(preset.value)
          }
          break
        case 'NamedRange':
          if (typeof value !== 'number') {
            const preset = option.presets[value as string]
            if (preset !== undefined) this.form()().value.set(preset)
          }
          break
      }
    })
  }

  protected toggleRandomize(checked: boolean) {
    if (checked) {
      this.form()().value.set('random')
    } else {
      this.form()().value.set(this.option().default)
    }
  }

  // no clue why this isn't allowed in the template as is
  protected asField(field: FieldTree<unknown>): Field<any, string | number> {
    return field
  }

  protected readonly Object = Object
}
