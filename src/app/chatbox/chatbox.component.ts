import {Component,  OnInit} from '@angular/core';
import * as $ from 'jquery';
import {FormControl, FormGroup} from "@angular/forms";
import {ChatService} from "../services/chat.service";
import {UserService} from "../services/user.service";
import {User} from "../models/user";
import {filter, interval, switchMap, tap,take, Observable, map, catchError, of} from "rxjs";
import {Chat} from "../models/chat";
import {Message} from "../models/message";
import {parseJson} from "@angular/cli/src/utilities/json-file";

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  chatForm: FormGroup;
  alluser: User[] ;
  users:User[] =[];
  chatId:any= 0;
  chatObj: Chat = new Chat();
  chatData: any;
  chatData2: any;
  messageObj: Message = new Message();
  messageList: any = [];
  allmessages: any = []
  secondUserName = 'Unkown';
  firstUserName = sessionStorage.getItem('username');
  senderEmail = sessionStorage.getItem('username');
  senderCheck = sessionStorage.getItem('username');
  constructor(private chatService: ChatService, private userService: UserService) {
    this.chatForm = new FormGroup({
      replymessage: new FormControl()
    });
  }

  ngOnInit() {
    // console.log("last message miniar" +this.getlastMessage("miniar"));
    // console.log("last message  zzz " +this.getlastMessage("zzz"));
    // console.log("firstname : "+this.firstUserName);
    // console.log("senderCheck : "+this.senderCheck);

    interval(100)
      .pipe(
        switchMap(() => this.userService.getAll())
      ).subscribe(data=> {

    //  console.log("last message salim " +this.getlastMessage("salim"));

      this.alluser = data;
      if(this.users.length===0){
          this.users=this.alluser;
          for(let i=0;i<this.users.length;i++){
            if(this.users[i].userName!=this.firstUserName){
            this.getlastMessage(this.users[i].userName)}
          }
      }
        if(this.alluser.length>this.users.length){
          this.users.push(this.alluser[this.alluser.length-1]);
          this.getlastMessage(this.users[this.users.length-1].userName);
        }
      this.lastMessageList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      console.log("chat id : " +this.chatId);

    });
    interval(700)
      .pipe(
        filter(() => this.chatId >0),
        switchMap(() => this.chatService.getChatById(this.chatId))
      )
      .subscribe(data=> {
        this.chatData = data;
        this.messageList = this.chatData.messages;
        if(this.goToChatCheck){
          this.allmessages=[];
          this.goToChatCheck=false;
        }
        if(this.allmessages.length ===0){
          this.allmessages=this.messageList;
        }
        else if(this.messageList.length>this.allmessages.length){
          this.allmessages.push(this.messageList[this.messageList.length-1]);
          console.log(this.allmessages)
        }
      });
  }

  sendMessage() {
    if(this.chatForm.value.replymessage!=null) {
      console.log(this.chatForm.value);
      this.messageObj.replymessage = this.chatForm.value.replymessage;
      this.messageObj.senderEmail = this.senderEmail;
      this.chatService.updateChat(this.messageObj, this.chatId).subscribe(data => {
        console.log(data);
        this.chatForm.reset();
        this.chatService.getChatById(this.chatId).subscribe(data => {
          console.log(data);
          this.chatData = data;
          this.messageList = this.chatData.messageList;
          this.secondUserName = this.chatData.secondUserName;
          this.updateLastMessageList(this.firstUserName,this.secondUserName,this.messageObj.replymessage,
            this.messageObj.senderEmail,new Date().toLocaleDateString('en-US', {year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }).replace(',', ''));
        })
      });
      $('.chat-bubble-animation').hide('slow').show('slow');
    }
  }
  goToChatCheck=false;
    goToChat(username:string) {
      if(this.secondUserName!=username){
      $('.col-md-8').hide('slow').show('slow');

      this.goToChatCheck=true;
      this.secondUserName=username;
      this.chatService.getChatByFirstUserNameAndSecondUserName(sessionStorage.getItem("username"),username)
        .subscribe((data:Chat[])=> {
            this.chatId=data[0].chatId;
          sessionStorage.setItem("chatId", this.chatId);
        },
        (error) => {
          if (error.status == 404) {
            this.chatObj.firstUserName = sessionStorage.getItem("username");
            this.chatObj.secondUserName = username;
            this.chatService.createChatRoom(this.chatObj).subscribe(
              (data) => {
                this.chatData = data;
                //console.log("data fel create " +this.chatData.chatId);
                this.chatId = this.chatData.chatId;
                sessionStorage.setItem("chatId", this.chatData.chatId);
              })
          }
        });}
  }
  sms:string;
  lastmessage:Chat[]=[];
  lastMessageList:Message[]=[];
  getlastMessage(username: string) {
    let msg;
    this.chatService.getLastMessage(sessionStorage.getItem("username"),username).subscribe(data => {
      console.log("data");
      console.log(data.replymessage);
      const isDuplicate = this.lastMessageList.some(item => item.firstUsername === data.firstUsername && item.secondUsername === data.secondUsername);

      if (!isDuplicate) {
        this.lastMessageList.push(data);
      }
    });
    console.log(this.lastMessageList)
  }
  updateLastMessageList(firstUsername: string, secondUsername: string, newReplyMessage: string,senderEmail:string, newTime: string): void {
    this.lastMessageList.forEach((message) => {
      if ((message.firstUsername === firstUsername && message.secondUsername === secondUsername) ||
        (message.firstUsername === secondUsername && message.secondUsername === firstUsername)) {
        message.replymessage = newReplyMessage;
        message.time = newTime;
        message.senderEmail=senderEmail;
      }
    });
    console.log(this.lastMessageList)
  }

}
