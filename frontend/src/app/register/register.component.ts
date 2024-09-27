import {Component} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    imports: [RouterLink, RouterOutlet, ReactiveFormsModule],
})

export class RegisterComponent {
    
    registerForm = new FormGroup({
        email: new FormControl(''),
        username: new FormControl(''),
        password: new FormControl(''),
    });

    formSubmit() {
        alert( this.registerForm.value.email +
             ' '+this.registerForm.value.username + 
            ' ' + this.registerForm.value.password);
    }   

}