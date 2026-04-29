import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MissionService } from '../../../core/services/missions.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mission, Ninja } from '../../../core/interfaces/models';

import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonSegment, 
  IonSegmentButton, IonLabel, IonList, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBadge, IonRefresher, 
  IonRefresherContent, IonSkeletonText, IonSearchbar, 
  IonButton, IonIcon, IonFooter
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { searchOutline, logOutOutline } from 'ionicons/icons'; 

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.page.html',
  styleUrls: ['./mission-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonSegment, 
    IonSegmentButton, IonLabel, IonList, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonBadge, IonRefresher, 
    IonRefresherContent, IonSkeletonText, IonSearchbar,
    IonButton, IonIcon, IonFooter
  ]
})
export class MissionListPage implements OnInit, OnDestroy {
  allMissions: Mission[] = [];
  filteredMissions: Mission[] = [];
  user: Ninja | null = null;
  
  selectedSegment: 'DISPONIBLE' | 'EN_CURSO' | 'COMPLETADA' = 'DISPONIBLE';
  searchTerm: string = '';
  isLoading = true;
  private refreshInterval: any;
  private updateSub!: Subscription;

  constructor(
    private missionService: MissionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ searchOutline, logOutOutline });
  }

  ngOnInit() {
    //Carga inicial
    this.user = this.authService.getCurrentUser();
    this.loadMissions();

    // Suscribirse a los cambios de las misiones para actualizar instantáneamente
    this.updateSub = this.missionService.missionUpdated.subscribe(() => {
      this.loadMissions();
    });

    // Comprobar si hay que refrescar la lista por el reinicio de los datos locales (cada 1 minuto)
    this.refreshInterval = setInterval(() => {
      this.loadMissions();
    }, 60000);
  }

  ionViewWillEnter() {
    //refrescamos los datos y los filtros.
    this.user = this.authService.getCurrentUser();
    
    // Siempre recargamos las misiones al entrar a la vista para 
    // reflejar de inmediato si alguna cambió a EN_CURSO o COMPLETADA
    this.loadMissions();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.updateSub && !this.updateSub.closed) {
      this.updateSub.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadMissions(event?: any) {
    if (this.allMissions.length === 0 || event) {
      this.isLoading = true;
    }

    this.missionService.getMissions().subscribe({
      next: (response) => {
        this.allMissions = Array.isArray(response) ? response : (response as any).data || [];
        
        this.applyFilters(); 
        this.isLoading = false;
        this.cdr.detectChanges(); 
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error cargando misiones', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (event) event.target.complete();
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredMissions = this.allMissions.filter(m => {
      //filtro por Estado de Pestañas
      const matchesStatus = m.status === this.selectedSegment;
      
      //filtro por Buscador
      const matchesSearch = m.title.toLowerCase().includes(term);
      
      return matchesStatus && matchesSearch;
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    this.applyFilters();
  }

  searchMissions(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  getBadgeColor(rank: string): string {
    switch(rank) {
      case 'S': return 'danger';
      case 'A': return 'warning';
      case 'B': return 'tertiary';
      default: return 'success';
    }
  }

  goToDetail(mission: Mission) {
    this.router.navigate(['/missions', mission.id]);
  }
}