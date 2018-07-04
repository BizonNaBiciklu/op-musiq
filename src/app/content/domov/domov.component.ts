import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-domov',
  templateUrl: './domov.component.html',
  styleUrls: ['./domov.component.css']
})
export class DomovComponent implements OnInit {
  showcaseCards: any = [
    {
      title: "Big selection",
      text: "Whole Youtube is your playground. You can listen to any music or other video found there.",
      img: "fas fa-podcast"
    },
    {
      title: "Listen with others",
      text: "Take turns with other users on who selects the music.",
      img: "fas fa-user-friends"
    },
    {
      title: "Chat",
      text: "Chat with others while listening. Share your love for a song, or just frown upon how garbage current track is.",
      img: "far fa-comment-alt"
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
