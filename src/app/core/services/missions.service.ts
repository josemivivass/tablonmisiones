import { Injectable } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { Mission } from '../interfaces/models';
import * as localDb from '../../missions.json';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private db: any;
  
  public missionUpdated = new Subject<void>();

  constructor() {
    // Inicializamos la base de datos en memoria para que se resetee al recargar la página.
    this.db = JSON.parse(JSON.stringify((localDb as any).default || localDb));
  }

  private getDb(): any {
    return this.db;
  }

  private saveDb(data: any): void {
    this.db = data;
  }

  // Obtener todas las misiones
  getMissions(): Observable<any> {
    const db = this.getDb();
    const missions = (db.missions || []).map((m: any) => {
      if (m.status !== 'DISPONIBLE') {
        const assignment = (db.assignments || []).find((a: any) => String(a.missionId) === String(m.id));
        const ninjaId = assignment ? assignment.ninjaId : m.assignedTo;
        if (ninjaId) {
          const ninja = (db.ninjas || []).find((n: any) => String(n.id) === String(ninjaId));
          if (ninja) {
            m.acceptedByNinjaName = ninja.username;
            m.acceptedByNinjaAvatar = ninja.avatarUrl;
          }
        }
      }
      return m;
    });
    return of(missions);
  }

  // Obtener una misión por ID
  getMissionById(id: string | number): Observable<Mission> {
    const db = this.getDb();
    const mission = db.missions.find((m: any) => String(m.id) === String(id));
    if (mission) {
      if (mission.status !== 'DISPONIBLE') {
        const assignment = (db.assignments || []).find((a: any) => String(a.missionId) === String(mission.id));
        const ninjaId = assignment ? assignment.ninjaId : mission.assignedTo;
        if (ninjaId) {
          const ninja = (db.ninjas || []).find((n: any) => String(n.id) === String(ninjaId));
          if (ninja) {
            mission.acceptedByNinjaName = ninja.username;
            mission.acceptedByNinjaAvatar = ninja.avatarUrl;
          }
        }
      }
      return of(mission);
    }
    return throwError(() => new Error('Misión no encontrada'));
  }

  // Aceptar una misión (PATCH)
  acceptMission(id: string | number, ninjaId: string, ninjaName: string): Observable<any> {
    return new Observable(observer => {
      const db = this.getDb();
      const missionIndex = db.missions.findIndex((m: any) => String(m.id) === String(id));
      if (missionIndex !== -1) {
        db.missions[missionIndex].status = 'EN_CURSO';
        db.missions[missionIndex].assignedTo = ninjaId;
        db.missions[missionIndex].acceptedByNinjaName = ninjaName;
        
        const ninja = (db.ninjas || []).find((n: any) => String(n.id) === String(ninjaId));
        if (ninja) {
          db.missions[missionIndex].acceptedByNinjaAvatar = ninja.avatarUrl;
        }

        if (!db.assignments) db.assignments = [];
        const assignment = db.assignments.find((a: any) => String(a.missionId) === String(id));
        if (assignment) {
          assignment.ninjaId = ninjaId;
          assignment.assignedAt = new Date().toISOString();
        } else {
          db.assignments.push({ missionId: String(id), ninjaId: ninjaId, assignedAt: new Date().toISOString() });
        }
        
        this.saveDb(db);
        this.missionUpdated.next();
        observer.next({ success: true, mission: db.missions[missionIndex] });
        observer.complete();
      } else {
        observer.error(new Error('Misión no encontrada'));
      }
    });
  }

  // Abandonar una misión
  abandonMission(id: string | number): Observable<any> {
    return new Observable(observer => {
      const db = this.getDb();
      const missionIndex = db.missions.findIndex((m: any) => String(m.id) === String(id));
      if (missionIndex !== -1) {
        db.missions[missionIndex].status = 'DISPONIBLE';
        db.missions[missionIndex].assignedTo = undefined;
        db.missions[missionIndex].acceptedByNinjaName = undefined;
        db.missions[missionIndex].acceptedByNinjaAvatar = undefined;
        
        if (db.assignments) {
          db.assignments = db.assignments.filter((a: any) => String(a.missionId) !== String(id));
        }

        this.saveDb(db);
        this.missionUpdated.next();
        observer.next({ success: true, mission: db.missions[missionIndex] });
        observer.complete();
      } else {
        observer.error(new Error('Misión no encontrada'));
      }
    });
  }

  // Completar/Reportar una misión (POST)
  reportMission(id: string | number, ninjaId: string, data: { reportText: string; evidenceImageUrl?: string }): Observable<any> {
    return new Observable(observer => {
      const db = this.getDb();
      const missionIndex = db.missions.findIndex((m: any) => String(m.id) === String(id));
      if (missionIndex !== -1) {
        db.missions[missionIndex].status = 'COMPLETADA';
        
        if (!db.assignments) db.assignments = [];
        const assignment = db.assignments.find((a: any) => String(a.missionId) === String(id));
        if (assignment) {
          assignment.reportText = data.reportText;
          assignment.evidenceImageUrl = data.evidenceImageUrl || null;
          assignment.ninjaId = ninjaId;
        } else {
          db.assignments.push({
            missionId: String(id),
            ninjaId: ninjaId,
            assignedAt: new Date().toISOString(),
            reportText: data.reportText,
            evidenceImageUrl: data.evidenceImageUrl || null
          });
        }
        
        const ninja = (db.ninjas || []).find((n: any) => String(n.id) === String(ninjaId));
        if (ninja) {
          db.missions[missionIndex].acceptedByNinjaName = ninja.username;
          db.missions[missionIndex].acceptedByNinjaAvatar = ninja.avatarUrl;
        }
        
        this.saveDb(db);
        this.missionUpdated.next();
        observer.next({ success: true, mission: db.missions[missionIndex] });
        observer.complete();
      } else {
        observer.error(new Error('Misión no encontrada'));
      }
    });
  }
}