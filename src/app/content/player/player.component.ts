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

  public localUser: any;
  private localUserID: String;

  private component: PlayerComponent = this;

  public playQueue: any[];
  public presentUsers: any[]; 

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

    //Set up callback for when YT API loads
    const self = this;
    window['onYouTubeIframeAPIReady'] = (e) => {
      //Set up song queue handler
      let queueHandler = this.playQueueDatabase.subscribe(result => {
        console.info("Received updated song queue:");
        console.info(result);
        this.playQueue = result;
        if (this.video == null){
          this.changeVideo(result[0].ytid);
        }
      });

      //Register user and set up user handler
      let userHandler = this.usersDatabase.subscribe(array => {
        console.info("Received updated user database:");
        console.info(array);
        this.presentUsers = array;
        if (this.localUser == undefined){
          console.warn("Local user not present");
          this.localUser = {
            currentlyPlaying: this.playQueue[0].ytid,
            lastReport: new Date(),
            timestamp: "0:00",
            username: "Unnamed Squid Warrior"
          }
          this.db.collection("users").add(this.localUser).then(res => {
            this.localUserID = res.id;
          });
        }
      });

      self.YT = window['YT'];
      self.player = new window['YT'].Player('player', {
        videoId: self.video,
        playerVars: {
          "autoplay": 1,
          //"controls": 0,
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

    window['navigatingFrom'] = (data) => {
      alert("deleting your mom, please wait");
      //Remove user
      this.db.doc("users/" + this.localUserID).delete();
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
        console.debug("Video ended, loading next one.");
        this.playQueue.splice(0, 1);
        this.changeVideo(this.playQueue[0].ytid);
        this.localUser.currentlyPlaying = this.playQueue[0].ytid;
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