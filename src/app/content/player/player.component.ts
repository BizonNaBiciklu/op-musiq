import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, OnDestroy {
  public static FIREBASE_REPORT_INTERVAL = 15000;

  public YT: any;
  public video: String = null;
  public player: any;

  public localUser: any;

  private static component: PlayerComponent;

  public playQueue: any[];
  public presentUsers: any[]; 

  private db: AngularFirestore;
  private playQueueDatabase: Observable<any[]>;
  private usersDatabase: Observable<any[]>;

  constructor(database: AngularFirestore) {
    PlayerComponent.component = this;
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
      let queueHandler = self.playQueueDatabase.subscribe(result => {
        console.info("Received updated song queue:");
        console.info(result);
        self.playQueue = result;
        if (self.video == null){
          self.changeVideo(result[0].ytid);
        }
      });

      //Register user and set up user handler
      let userHandler = self.usersDatabase.subscribe(array => {
        console.info("Received updated user database:");
        console.info(array);
        self.presentUsers = array;
        if (self.localUser == undefined){
          console.warn("Local user not present");
          self.localUser = {
            firebaseID: self.db.createId(),
            currentlyPlaying: self.playQueue[0].ytid,
            lastReport: new Date(),
            timestamp: 0,
            username: "Unnamed Squid Warrior"
          }
          self.db.collection("users").doc(self.localUser.firebaseID).set(self.localUser);
          setInterval(self.updateDatabaseTimestamp, PlayerComponent.FIREBASE_REPORT_INTERVAL);
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
  }

  ngOnDestroy(){
    //Remove user
    this.db.doc("users/" + this.localUser.firebaseID).delete();
  }

  onPlayerStateChange(event) {
    switch (event.data) {
      case window['YT'].PlayerState.PAUSED:
        PlayerComponent.component.player.playVideo();
        break;
      case window['YT'].PlayerState.ENDED:
        console.debug("Video ended, loading next one.");
        PlayerComponent.component.playQueue.splice(0, 1);
        PlayerComponent.component.changeVideo(PlayerComponent.component.playQueue[0].ytid);
        PlayerComponent.component.localUser.currentlyPlaying = PlayerComponent.component.playQueue[0].ytid;
        break;
    };
  };

  changeVideo(videoId: String){
    PlayerComponent.component.video = videoId;
    PlayerComponent.component.player.videoId = videoId;
    PlayerComponent.component.player.loadVideoById(videoId);
  }

  updateUserOnDB(){
    PlayerComponent.component.localUser.lastReport = new Date();
    PlayerComponent.component.db.doc("users/" + PlayerComponent.component.localUser.firebaseID).update(PlayerComponent.component.localUser);
    PlayerComponent.component.cleanupInactiveUsers();
  }

  updateDatabaseTimestamp(){
    PlayerComponent.component.localUser.timestamp = Math.round(PlayerComponent.component.player.getCurrentTime());
    PlayerComponent.component.updateUserOnDB();
  }

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + PlayerComponent.component.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };


  //Stuff that really should have been on a dedicated server
  cleanupInactiveUsers(){
    PlayerComponent.component.presentUsers.forEach((value, index, arr) => {
      if (value.lastReport.seconds + PlayerComponent.FIREBASE_REPORT_INTERVAL / 500 < Date.now() / 1000){
        let doc: AngularFirestoreDocument = this.db.doc("users/" + value.firebaseID);
        doc.delete();
      }
    }, PlayerComponent.component);
  }
}