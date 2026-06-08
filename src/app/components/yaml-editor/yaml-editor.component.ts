import { Component, effect, input, linkedSignal, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FormValueControl, ValidationError } from '@angular/forms/signals'
import { ErrorStateMatcher } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import YAML from 'yaml'

@Component({
  selector: 'app-yaml-editor',
  imports: [MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './yaml-editor.component.html',
  styleUrl: './yaml-editor.component.scss',
  standalone: true,
})
export class YamlEditorComponent implements FormValueControl<unknown> {
  readonly value = model<unknown>(null)
  readonly label = input.required<string>()
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([])
  readonly invalid = input<boolean>(false)

  protected readonly rawValue = signal('')
  protected readonly allErrors = linkedSignal(() => this.errors())

  protected matcher: ErrorStateMatcher = {
    isErrorState: (_control, _form): boolean => {
      return this.invalid() || this.allErrors().length !== 0
    },
  }

  // whether an update to value comes from within this component
  private _hack = false

  constructor() {
    effect(() => {
      if (this._hack) {
        this._hack = false
      } else {
        const value = this.value()
        if (value === null) {
          this.rawValue.set('')
        } else {
          this.rawValue.set(YAML.stringify(value).trimEnd())
        }
      }
    })
    effect(() => {
      this.allErrors.update(errs => errs.filter(err => err.kind !== 'yaml'))
      try {
        const parsed = YAML.parse(this.rawValue())
        this._hack = true
        this.value.set(parsed)
      } catch (err: unknown) {
        this.allErrors.update(errs => [...errs, { kind: 'yaml', message: err + '' }])
      }
    })
  }
}
