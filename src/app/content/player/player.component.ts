import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  public YT: any;
  public video: String = null;
  public player: any;
  private component: PlayerComponent = this;
  private playQueue: any[];

  private db: AngularFirestore;
  private playQueueDatabase: Observable<any[]>;
  private usersDatabase: Observable<any[]>;

  constructor(database: AngularFirestore) {
    this.db = database;
    this.playQueueDatabase = database.collection("songQueue").valueChanges();
    this.usersDatabase = database.collection("users").valueChanges();
  }

  init(){
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var titleTag = document.getElementsByTagName('script')[0];
    titleTag.parentNode.insertBefore(tag, titleTag);
  }

  ngOnInit() {
    this.init();

    //Set up song queue handler
    let handler = this.playQueueDatabase.subscribe(result => {
      console.info("Received updated song queue:");
      console.info(result);
      this.playQueue = result;
      if (this.video == null){
        this.changeVideo(result[0].ytid);
      }
    });

    const self = this;
    window['onYouTubeIframeAPIReady'] = (e) => {
      self.YT = window['YT'];
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
        }
      });
    };
  }

  onPlayerStateChange(event) {
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
    this.video = videoId;
    this.player.videoId = videoId;
    this.player.loadVideoById(videoId);
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

