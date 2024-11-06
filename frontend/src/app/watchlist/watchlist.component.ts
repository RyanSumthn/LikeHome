import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../service/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, 
            MatDatepickerModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss'
})
export class WatchlistComponent implements OnInit {
  watchlistHotels: Array<any> = [];
  loading: boolean = false;

  options = [
    { label: 'City', value: 'city' },
    { label: 'Hotel Name', value: 'hotel_name' },
    { label: 'Price', value: 'min_rate' },
    { label: 'Check In', value: 'check_in' },
    { label: 'Check Out', value: 'check_out' },
  ];

  sortFilter = new FormGroup({
    selectedChoice: new FormControl('', Validators.required),
  });

  constructor(private apiService: ApiService, private router: Router, private activatedroute: ActivatedRoute) {}

  getWatchlist(): void {
    this.apiService.getBackendRequest('get-watchlist')
    .subscribe({
      next: (data: any) => {
        console.log(data); // look in inspect element console to see what format data is in for parsing
        this.watchlistHotels = data;
      },
      error: (error: any) => {
        console.log('Watchlist Results Error')
        console.log(error);
      }
    });
  }

  // TODO backend request to sort hotels, maybe just do this browser side
  sortFilterSubmit(): void {
    this.loading = true;
    console.log('Sort Filter Submit with choice: ', this.sortFilter.value.selectedChoice);
    console.log('Watchlist Hotels: ', this.watchlistHotels);
    let param = this.sortFilter.value.selectedChoice;
    if (param === 'city' || param === 'hotel_name') { // sorting by a string field
      this.watchlistHotels.sort((a, b) => {
        return a[param].localeCompare(b[param]);
      });
    } else if (param === 'min_rate') { // sorting by a number field
      this.watchlistHotels.sort((a, b) => { return a[param] - b[param]; });
    } else if (param === 'check_in' || param === 'check_out') { // sorting by a date field
      this.watchlistHotels.sort((a, b) => {
        return new Date(a[param]).getTime() - new Date(b[param]).getTime();
      });
    }
    this.loading = false;
  }

  seeHotelDetails(index: number): void {
    let selectedHotel = this.watchlistHotels[index];
    selectedHotel['minRate'] = selectedHotel['min_rate'];
    selectedHotel['maxRate'] = selectedHotel['max_rate'];
    selectedHotel['name'] = selectedHotel['hotel_name'];
    this.router.navigate(['/hotel-details'], { 
      queryParams: 
        { 
          checkIn: selectedHotel['check_in'], 
          checkOut: selectedHotel['check_out'], 
          details: JSON.stringify(selectedHotel) 
        } 
    });
  }

  ngOnInit(): void {
    this.getWatchlist();
  }
}