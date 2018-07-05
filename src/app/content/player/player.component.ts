import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  public YT: any;
  public video: any;
  public player: any;
  public reframed: boolean = false;
  private component: PlayerComponent = this;

  constructor() { }

  init(){
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var titleTag = document.getElementsByTagName('script')[0];
    titleTag.parentNode.insertBefore(tag, titleTag);
  }

  ngOnInit() {
    this.init();
    this.video = "y6120QOlsfU";

    let self=this;

    window['onYouTubeIframeAPIReady'] = (e) => {
      self.YT = window['YT'];
      self.reframed = false;
      self.player = new window['YT'].Player('player', {
        videoId: self.video,
        playerVars: {
          "autoplay": 1,
          "controls": 0,
          "disablekb": 1,
          "enablejsapi": 1,
          "fs": 0,
          "iv_load_policy": 3,
          "showinfo": 0,
          "rel": 0,
        },
        events: {
          'onStateChange': self.onPlayerStateChange.bind(self),
          'onError': self.onPlayerError.bind(self),
          'onReady': (e) => {
            console.log("onReady");
          }
        }
      });
    };
  }

  onPlayerStateChange(event) {
    console.log(event);
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          console.log('started ' + this.cleanTime());
        } else {
          console.log('playing ' + this.cleanTime());
        };
        break;
      case window['YT'].PlayerState.PAUSED:
        this.component.player.playVideo();
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
        };
        break;
      case window['YT'].PlayerState.ENDED:
        console.log('ended ');
        break;
    };
  };

  //utility
  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  };

  changeVideo(videoId: String){
    this.video = String;
    this.player.videoId = String;
    this.player.loadVideo();
  }

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };
}
