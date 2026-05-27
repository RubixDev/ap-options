import { Component } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { ThemePickerComponent } from './components/theme-picker/theme-picker.component'
import { OptionsCreatorComponent } from './components/options-creator/options-creator.component'

@Component({
  selector: 'app-root',
  imports: [MatCardModule, ThemePickerComponent, OptionsCreatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {}
