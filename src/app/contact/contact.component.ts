import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  submitSuccess = false;
  submitError = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.submitSuccess = false;
    this.submitError = false;

    if (this.contactForm.valid) {
      // In a real app, you would send this data to a backend service
      console.log('Form submitted:', this.contactForm.value);
      
      // Simulate API call success
      setTimeout(() => {
        this.submitSuccess = true;
        this.submitted = false;
        this.contactForm.reset();
        
        // Reset form state
        Object.keys(this.contactForm.controls).forEach(key => {
          this.contactForm.get(key)?.setErrors(null);
        });
      }, 1500);
    } else {
      this.submitError = true;
    }
  }

  get f() {
    return this.contactForm.controls;
  }
}
