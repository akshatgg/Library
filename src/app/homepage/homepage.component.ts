import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Add animation class to elements when the page loads
    setTimeout(() => {
      this.animateOnScroll();
    }, 100);
    
    // Add scroll event listener for animations
    window.addEventListener('scroll', this.animateOnScroll);
  }
  
  scrollToFeatures() {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  navigateTo(path: string, queryParams: any = {}) {
    this.router.navigate([path], { queryParams });
  }
  
  animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .quick-access-card, .section-title, .stat-item');
    
    elements.forEach((element) => {
      const position = element.getBoundingClientRect();
      
      // Check if element is in viewport
      if (position.top < window.innerHeight - 100) {
        element.classList.add('visible');
      }
    });
  }
  
  ngOnDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener('scroll', this.animateOnScroll);
  }
}
