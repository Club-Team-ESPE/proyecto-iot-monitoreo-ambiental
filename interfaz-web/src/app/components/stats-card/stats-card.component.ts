import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  imports: [NgClass,CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() average: number = 0;
  @Input() max: number = 0;
  @Input() min: number = 0;
  @Input() icon: string = 'fa-chart-line';
  @Input() color: string = 'primary';
}
