import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  linkedSignal,
  OnInit,
  output,
  runInInjectionContext,
  signal,
  untracked,
  viewChild,
} from '@angular/core'
import { OptionGroupComponent } from '../option-group/option-group.component'
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion'
import { Visibility, World } from '../../model/options.model'
import { Game } from '../../model/player.model'
import { FieldTree, form, max, min, SchemaPath } from '@angular/forms/signals'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { IndexWorld } from '../../model/index.model'
import { MatTooltipModule } from '@angular/material/tooltip'

@Component({
  selector: 'app-game-options',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    FormsModule,
    OptionGroupComponent,
  ],
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.scss',
  standalone: true,
})
export class GameOptionsComponent implements OnInit {
  readonly schema = input.required<World>()
  readonly indexWorld = input.required<IndexWorld>()
  readonly initialValue = input<Game>({})

  private readonly options = linkedSignal<Game>(() =>
    Object.fromEntries(
      this.schema()
        .groups.flatMap(group => group.options)
        .map(option => [
          option.name,
          untracked(() => this.initialValue()[option.name]) ?? option.default,
        ]),
    ),
  )
  readonly valueChange = output<Game>()

  protected readonly filter = signal<Visibility[]>([
    Visibility.Template,
    Visibility.SimpleUi,
    Visibility.ComplexUi,
  ])
  protected readonly filterMask = computed(() =>
    this.filter().reduce((a, b) => a | b, Visibility.None),
  )
  protected readonly showHidden = signal(false)

  protected readonly accordion = viewChild.required(MatAccordion)

  private injector = inject(Injector)
  protected form?: FieldTree<Game>

  constructor() {
    effect(() => this.valueChange.emit(this.options()))
  }

  // i hate everything about this
  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      this.form = form(this.options, p => {
        for (const group of this.schema().groups) {
          for (const option of group.options) {
            switch (option.type) {
              case 'NamedRange':
              case 'Range':
                min(p[option.name] as SchemaPath<string | number>, option.min, {
                  message: `Setting must be at least ${option.min}`,
                })
                max(p[option.name] as SchemaPath<string | number>, option.max, {
                  message: `Setting must be at most ${option.max}`,
                })
                break
              case 'OptionCounter':
                if (option.min !== null) {
                  min(p[option.name] as SchemaPath<string | number>, option.min, {
                    message: `Values must be at least ${option.min}`,
                  })
                }
                if (option.max !== null) {
                  max(p[option.name] as SchemaPath<string | number>, option.max, {
                    message: `Values must be at most ${option.max}`,
                  })
                }
                break
            }
          }
        }
      })
    })
  }

  protected readonly Visibility = Visibility
}
