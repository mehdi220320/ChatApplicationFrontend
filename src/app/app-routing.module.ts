import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { MainComponent } from './main/main.component';
import { UserComponent } from './user/user.component';
import {ChatboxComponent} from "./chatbox/chatbox.component";

const routes: Routes = [
  { path: 'chat', component: ChatComponent },
  { path: 'user', component: UserComponent },
  { path: '', component: MainComponent },
  { path: 'chatbox', component: ChatboxComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
