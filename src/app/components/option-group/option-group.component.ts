import { Component, computed, input } from '@angular/core'
import { MatExpansionModule } from '@angular/material/expansion'
import { OptionEditComponent } from '../option-edit/option-edit.component'
import { OptionGroup, Visibility } from '../../model/options.model'
import { FieldTree } from '@angular/forms/signals'
import { Game } from '../../model/player.model'

@Component({
  selector: 'app-option-group',
  imports: [MatExpansionModule, OptionEditComponent],
  templateUrl: './option-group.component.html',
  styleUrl: './option-group.component.scss',
  standalone: true,
})
export class OptionGroupComponent {
  readonly group = input.required<OptionGroup>()
  readonly form = input.required<FieldTree<Game>>()
  readonly filter = input(Visibility.All)

  protected readonly filteredOptions = computed(() =>
    this.group().options.filter(o => (o.visibility & this.filter()) !== 0),
  )
}
