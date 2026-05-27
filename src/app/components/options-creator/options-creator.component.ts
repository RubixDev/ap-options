import { httpResource } from '@angular/common/http'
import { Component, computed, effect, signal } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { GameOptionsComponent } from '../game-options/game-options.component'
import { World } from '../../model/options.model'
import { PlayerForm, PlayerYaml } from '../../model/player.model'
import { form, FormField, required, submit } from '@angular/forms/signals'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { saveAs } from 'file-saver'

interface IndexWorld {
  name: string
  game: string
  version: string
  hidden: boolean
}

@Component({
  selector: 'app-options-creator',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    GameOptionsComponent,
    FormField,
  ],
  templateUrl: './options-creator.component.html',
  styleUrl: './options-creator.component.scss',
  standalone: true,
})
export class OptionsCreatorComponent {
  protected readonly index = httpResource<IndexWorld[]>(() => '/index.json')

  private readonly model = signal<PlayerForm>({
    slot: '',
    description: 'YAML generated with ap-options.rubixdev.de',
    game: '',
    options: {},
  })

  protected readonly form = form(this.model, path => {
    required(path.slot, { message: 'Player name is required' })
    required(path.game, { message: 'A game is required' })
  })

  private readonly rawWorldSchema = httpResource(
    computed(() => {
      const game = this.form.game().value()
      if (game === '') return undefined
      const worldName = this.index.value()?.find(w => w.game === game)?.name
      if (worldName === undefined) return undefined
      return `/schema/${worldName}.json`
    }),
  )
  protected readonly worldSchema = computed(() => {
    const json = this.rawWorldSchema.value()
    if (json === undefined) return undefined
    return World.parse(json)
  })

  constructor() {
    effect(() => console.log(this.model()))
  }

  // TODO: error handling
  protected async importFile(event: Event) {
    console.log('importing file')

    const files = (event.target as HTMLInputElement).files
    if (files === null) return
    const file = files[0]
    const text = await file.text()
    console.log('read text:', text)
    this.model.set(PlayerYaml.parse(text))
  }

  protected exportFile(event: Event) {
    event.preventDefault()
    submit(this.form, async () => {
      console.log('saving file')
      const yamlString = PlayerYaml.encode(this.model())
      console.log('yaml string to save:', yamlString)
      saveAs(
        new Blob([yamlString], { type: 'application/yaml;charset=utf-8' }),
        `${this.model().slot}.yaml`,
      )
    })
  }
}
