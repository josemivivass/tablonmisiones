import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

import { 
  IonContent, IonHeader, IonToolbar, IonButtons, 
  IonButton, IonIcon, IonItem, IonLabel, IonInput,
  IonSpinner, IonTitle
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personCircleOutline, keyOutline, person, logIn, personOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    IonContent, 
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSpinner
  ]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ personCircleOutline, keyOutline, person, logIn, personOutline, lockClosedOutline });

    this.loginForm = this.fb.group({
      username: ['user', Validators.required],
      password: ['123456789#', Validators.required]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/missions']);
        },
        error: async (err) => {
          this.isLoading = false;
          const toast = await this.toastCtrl.create({
            message: err.message || 'Credenciales inválidas',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      });
    }
  }
}