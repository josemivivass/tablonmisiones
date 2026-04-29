import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

import { 
  IonContent, IonHeader, IonToolbar, IonButtons, 
  IonBackButton, IonButton, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonIcon, IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBack, personAddOutline, personOutline, lockClosedOutline, ribbonOutline, shieldOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonButtons, 
    IonBackButton, IonButton, IonItem, IonLabel, IonInput, 
    IonSelect, IonSelectOption, IonIcon, IonSpinner
  ]
})
export class RegisterPage {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ arrowBack, personAddOutline, personOutline, lockClosedOutline, ribbonOutline, shieldOutline });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rank: ['Genin', Validators.required]
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.showToast('¡Registro exitoso!', 'success');
          this.router.navigate(['/missions']);
        },
        error: async (err) => {
          this.isLoading = false;
          this.showToast(err.message || 'Error en el registro', 'danger');
        }
      });
    }
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}