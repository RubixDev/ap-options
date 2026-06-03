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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { FormsModule } from '@angular/forms'

type Tag = 'ad'

interface IndexWorld {
  name: string
  game: string
  version: string
  hidden: boolean
  sane_version?: string // this is always semver
  display_name?: string
  tags: Tag[]
  wiki?: string
  discord?: string
}

const BASE_URL = 'https://index.ap-options.rubixdev.de'

@Component({
  selector: 'app-options-creator',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    FormField,
    FormsModule,
    GameOptionsComponent,
  ],
  templateUrl: './options-creator.component.html',
  styleUrl: './options-creator.component.scss',
  standalone: true,
})
export class OptionsCreatorComponent {
  private readonly index = httpResource<IndexWorld[]>(() => `${BASE_URL}/index.json`)
  protected readonly showAd = signal(false)
  protected readonly filteredIndex = computed(() => {
    const index = this.index.value()
    if (index === undefined) return undefined
    return index.filter(world => !world.tags?.includes('ad') || this.showAd())
  })

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
      return `${BASE_URL}/${worldName}.json`
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
