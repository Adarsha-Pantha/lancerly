import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map socket.id -> userId
  private readonly users = new Map<string, string>();

  constructor(
    private readonly jwt: JwtService,
    private readonly conversations: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.query?.token as string | undefined);

      if (!token || typeof token !== 'string') {
        client.disconnect();
        return;
      }

      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      if (!payload?.sub) {
        client.disconnect();
        return;
      }

      this.users.set(client.id, payload.sub);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      attachmentUrl?: string;
      attachmentName?: string;
    },
  ) {
    const userId = this.users.get(client.id);
    if (!userId) {
      client.disconnect();
      return;
    }
    if (!data?.conversationId || (!data?.content?.trim() && !data?.attachmentUrl)) return;

    const message = await this.conversations.sendMessage(
      data.conversationId,
      userId,
      { 
        content: data.content?.trim() || "",
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName
      },
    );

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('message', message);
  }
}


