import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-domov',
  templateUrl: './domov.component.html',
  styleUrls: ['./domov.component.css']
})
export class DomovComponent implements OnInit {
  showcaseCards: any = [
    {
      title: "Slow",
      text: "As slow as a music player can get.",
      img: ""
    },
    {
      title: "Ugly",
      text: "Because who looks at a music player while the music is playing anyway?",
      img: ""
    },
    {
      title: "Works",
      text: "We ran out of stupid promo ideas, just leave us alone, ok?",
      img: ""
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
