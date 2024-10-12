import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../service/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit {
  searchResults: Array<any> = [];
  loading: boolean = false;
  searchFilter = new FormGroup({});

  constructor(private route: ActivatedRoute, private apiService: ApiService, private router: Router) {}

  formatDate(date: Date): string {
    // if date is invalid return empty string
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // TODO will cause problems if user enters new date but does not hit search, better solution is to change backend response
  openHotel(i: number): void {
    this.router.navigate(['/hotel-details'], { 
      queryParams: 
        { 
          checkIn: this.searchFilter.get('check_in')?.value, 
          checkOut: this.searchFilter.get('check_out')?.value, 
          details: JSON.stringify(this.searchResults[i]) 
        } 
    });
  }

  searchFilterSubmit(): void {
    console.log('Search Filter Submitted:', this.searchFilter.value);
    this.search(this.searchFilter.value);
  }

  search(params: any): void {
    this.loading = true;
    this.apiService.postBackendRequest('search', params)
        .subscribe({
          next: (response) => {
            console.log("Search Success");
            console.log(response['status']);
            console.log(response['hotels']);
            this.searchResults = response['hotels'];
            this.loading = false;
          },
          error: (error) => {
            console.log("Search Error");
            console.log(error);
            this.loading = false;
          }
        })
  }

  replaceImage(event: any) {
    event.target.src = 'assets/images/nexus_logo.png';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchFilter.addControl('radius', new FormControl('20', Validators.required));
      this.searchFilter.addControl('location', new FormControl(params['location'] ?? '', Validators.required));
      this.searchFilter.addControl('check_in', new FormControl(this.formatDate(new Date(params['check_in'])), Validators.required));
      this.searchFilter.addControl('check_out', new FormControl(this.formatDate(new Date(params['check_out'])), Validators.required));
      this.searchFilter.addControl('rooms', new FormControl(params['rooms'] ?? '', Validators.required));
      this.searchFilter.addControl('adults', new FormControl(params['adults'] ?? '', Validators.required));
      this.searchFilter.addControl('children', new FormControl(params['children'] ?? '', Validators.required));
      this.searchFilter.addControl('radius', new FormControl(params['radius'] ?? '', Validators.required));
      this.searchFilter.addControl('min_rate', new FormControl(params['min_rate'] ?? '', Validators.required));
      this.searchFilter.addControl('max_rate', new FormControl(params['max_rate'] ?? '', Validators.required));

      console.log('Search Filters:', this.searchFilter.value);
    });

    this.search(this.searchFilter.value);
  }
}
