import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionService } from '../../../core/services/missions.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mission, Ninja } from '../../../core/interfaces/models';

import { 
  IonContent, IonHeader, IonToolbar, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonSpinner, IonTitle,
  IonTextarea, IonItem, IonLabel, IonAvatar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, trashOutline, sendOutline, alertCircleOutline, checkmarkCircleOutline, lockClosedOutline, cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-mission-detail',
  templateUrl: './mission-detail.page.html',
  styleUrls: ['./mission-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonButtons, 
    IonButton, IonIcon, IonSpinner, IonTitle,
    IonTextarea, IonItem, IonLabel, IonAvatar
  ]
})
export class MissionDetailPage implements OnInit {
  mission: Mission | undefined;
  user: Ninja | null = null;
  isLoading = true;
  debugInfo = '';

  // Variables para el reporte
  reportText = '';
  evidenceFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionService: MissionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ arrowBack, cloudUploadOutline, trashOutline, sendOutline, alertCircleOutline, checkmarkCircleOutline, lockClosedOutline, cameraOutline });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.loadMissionByList(idParam);
    } else {
      this.finishLoading('Error: URL sin ID');
    }
  }

  loadMissionByList(id: string) {
    this.isLoading = true;
    this.missionService.getMissions().subscribe({
      next: (response) => {
        const list: Mission[] = Array.isArray(response) ? response : (response as any).data || [];
        this.mission = list.find(m => m.id == id || m.id === Number(id));

        if (this.mission) {
          this.finishLoading();
        } else {
          this.finishLoading(`Misión no encontrada.`);
        }
      },
      error: (err) => {
        this.finishLoading('Error de conexión.');
      }
    });
  }

  finishLoading(errorMsg: string = '') {
    this.isLoading = false;
    if (errorMsg) this.debugInfo = errorMsg;
    this.cdr.detectChanges();
  }

  //LÓGICA DE PERMISOS
  
  get canAccept(): boolean {
    if (!this.user || !this.mission) return false;
    const rankValues: any = { 'Genin': 1, 'Chunin': 2, 'Jonin': 3, 'Kage': 4 };
    const missionDifficulty: any = { 'D': 1, 'C': 2, 'B': 2, 'A': 3, 'S': 4 };
    return (rankValues[this.user.rank] || 0) >= (missionDifficulty[this.mission.rankRequirement] || 0);
  }

  get isAssignedToMe(): boolean {
    return this.mission?.acceptedByNinjaName === this.user?.username;
  }

  get canSubmit(): boolean {
    return this.isAssignedToMe && (this.reportText.trim().length > 0 || this.evidenceFile !== null);
  }

  //ACCIONES

  acceptMission() {
    if (!this.mission || !this.user || this.user.id === undefined) return;
    
    this.isLoading = true;

    this.missionService.acceptMission(this.mission.id, String(this.user.id), this.user.username).subscribe({
      next: (response) => {
        this.mission = response.mission;
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.finishLoading('Error al aceptar la misión.');
      }
    });
  }

  abandonMission() {
    if (!this.mission) return;
    if (confirm('¿Abandonar misión? Esto afectará tu honor.')) {
      this.isLoading = true;
      this.missionService.abandonMission(this.mission.id).subscribe({
        next: () => {
          this.reportText = '';
          this.evidenceFile = null;
          this.isLoading = false;
          this.router.navigate(['/missions']);
        },
        error: (err) => {
          this.finishLoading('Error al abandonar la misión.');
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.evidenceFile = file;
    }
  }

  submitReport() {
    if (!this.mission || !this.user || this.user.id === undefined) return;
    
    this.isLoading = true;
    
    const evidenceUrl = this.evidenceFile ? URL.createObjectURL(this.evidenceFile) : undefined;

    this.missionService.reportMission(this.mission.id, String(this.user.id), { 
      reportText: this.reportText, 
      evidenceImageUrl: evidenceUrl 
    }).subscribe({
      next: (response) => {
        this.mission = response.mission;
        this.isLoading = false;
        this.router.navigate(['/missions']);
      },
      error: (err) => {
        this.finishLoading('Error al enviar el reporte.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/missions']);
  }
}