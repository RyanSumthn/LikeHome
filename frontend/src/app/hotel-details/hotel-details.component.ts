import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule, ReactiveFormsModule, MatDatepickerModule],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.scss'
})
export class HotelDetailsComponent implements OnInit{
  // used when clicked from search-results
  details: any = {};
  rooms: Array<any> = []; 

  // used when clicked from account-details
  accountDetails: any = {};
  isAccount: boolean = false;
  modifying: boolean = false;
  modifyRoom: any = {};
  modifyForm = new FormGroup({
    checkIn: new FormControl<Date | null>(null),
    checkOut: new FormControl<Date | null>(null),
    nights: new FormControl<number | null>(null),
    id: new FormControl(0, Validators.required),
  });

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  // used for formatting when modifying the date
  selectionFormatDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    // create a date in UTC, then get the local equivalent
    return new Date(Date.UTC(year, month-1, day+1));
  }

  // used for formatting when sending the date to backend to save
  sendFormatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  startModify(reservationId: number) { 
    this.modifying = true;
    console.log("start modifying");
    this.modifyRoom = this.accountDetails;
    // initialize form with current values
    this.modifyForm.setValue({
      checkIn: this.selectionFormatDate(this.accountDetails['check_in']),
      checkOut: this.selectionFormatDate(this.accountDetails['check_out']),
      nights: this.accountDetails['nights'],
      id: reservationId,
    })
    console.log(this.modifyRoom);
  }

  endModify() { 
    console.log("end modifying");
    console.log(this.modifyForm.value);
    console.log(this.accountDetails);
    // TODO check fields
    // send updated accountDetails object to checkout page
    this.accountDetails['checkIn'] = this.sendFormatDate(this.modifyForm.value.checkIn);
    this.accountDetails['checkOut'] = this.sendFormatDate(this.modifyForm.value.checkOut);
    this.accountDetails['price'] = this.accountDetails['rate'];
    this.accountDetails['hotel'] = this.accountDetails['hotel_name'];
    this.accountDetails['nights'] = this.modifyForm.value.nights;
    this.accountDetails['room'] = this.accountDetails['room_name'];
    this.accountDetails['reservationId'] = this.modifyForm.value.id;
    this.modifying = false;
    this.router.navigate(['/checkout'], { queryParams: { details: JSON.stringify(this.accountDetails) } }); // TODO send things in query params

    /* TODO Move to confirmation page
    this.apiService.postBackendRequest('modify-reservation', this.modifyForm.value)
    .subscribe({
      next: (data: any) => {
        console.log(data);
        // TODO check fields
        // this.router.navigate(['/confirmation']);
        this.modifying = false;
      },
      error: (error: any) => {
        console.log(error);
        alert("Error modifying booking");
        this.modifying = false;
      }
    }); */
  }

  cancelModify() {
    console.log("cancel modifying");
    this.modifying = false;
  }

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

  updateCheckIn(val: Date | null | undefined) {
    this.modifyForm.patchValue(
      { 
        nights: this.calculateDaysBetween(
          this.sendFormatDate(val), 
          this.sendFormatDate(this.modifyForm.value.checkOut)
        ) 
      }
    );
  }

  updateCheckOut(val: Date | null | undefined) {
    this.modifyForm.patchValue(
      { 
        nights: this.calculateDaysBetween(
          this.sendFormatDate(this.modifyForm.value.checkIn), 
          this.sendFormatDate(val)
        ) 
      }
    );
  }

  ngOnInit(): void {
      //  listen for changes in check in/ out for hotel details from myBookings to compute nights
      this.modifyForm.get('checkIn')?.valueChanges.subscribe((value) => this.updateCheckIn(value));
      this.modifyForm.get('checkOut')?.valueChanges.subscribe((value) => this.updateCheckOut(value));

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