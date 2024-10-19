import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.scss'
})
export class HotelDetailsComponent implements OnInit{
  details: any = {};
  accountDetails: any = {};
  isAccount: boolean = false;
  rooms: Array<any> = [];

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  replaceImage(event: any) {
    event.target.src = 'assets/images/nexus_logo.png';
  }

  randomImage(): string {
    let min = 0; // min index
    let max = 3; // max index

    let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return this.details['images'][randomNumber];
  }

  checkout(i: number) {
    // ensure user is logged in
    this.apiService.getBackendRequest('get-session')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let room = this.rooms[i];
          let details = {
            'hotel': this.details['name'],
            'room': room['name'],
            'price': room['netRate'],
            'adults': room['adults'],
            'children': room['children'],
            'checkIn': this.details['checkIn'],
            'checkOut': this.details['checkOut'],
            'nights': this.details['nights'],
            'address': this.details['address'],
            'city': this.details['city'],
            'images': this.details['images'],
            'description': this.details['description'],
            'phone': this.details['phone'],
            'website': this.details['web'],
            'email': this.details['email'],
          }
          console.log("details sent to checkout: " + details);
          this.router.navigate(['/checkout'], { queryParams: { details: JSON.stringify(details) } });
        },
        error: (error: any) => {
          console.log(error);
          alert("Please login to book a room");
        }
      });
  }

  calculateDaysBetween(date1: string, date2: string): number {
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    // Calculate the difference in milliseconds
    const diffInMs = secondDate.getTime() - firstDate.getTime();
    // Convert milliseconds to days
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
    return Math.abs(diffInDays); // Use Math.abs to handle negative values
  }

  backToAccount(){
    this.router.navigate(['/account-details']);
  }

  ngOnInit(): void {
      // moves to the top of the page when finished navigating (back&forth)
      // TODO seems to not work with <-- back arrows
      this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
              window.scrollTo(0, 0)
          }
      });

      // receive params from hotel see details
      this.route.queryParams.subscribe(params => {
        this.details = JSON.parse(params['details']);
        this.details['checkIn'] = params['checkIn'];
        this.details['checkOut'] = params['checkOut'];
        this.details['nights'] = this.calculateDaysBetween(this.details['checkIn'], this.details['checkOut']);
        this.rooms = this.details['rooms'];
      });

      // receives parameters from the account-details Page
      this.route.queryParams.subscribe(params => {
        this.accountDetails = JSON.parse(params['accountDetails']);
        console.log(this.accountDetails);
        this.isAccount = params['fromAccount'];
        // html will show both pages based on data from search-results OR account details
        //tells us that this is from the account-details page
        console.log(this.isAccount);
      });
  }
}