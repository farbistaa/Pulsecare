import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Send, Heart, Phone, MessageCircle } from 'lucide-react';
import type { User } from '@shared/schema';

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: User;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export default function MessagingModal({ open, onOpenChange, recipient }: MessagingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: messages = [] } = useQuery({
    queryKey: [`/api/messages/${recipient.id}`],
    enabled: open && !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          content
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipient.id}`] });
      toast({ title: "Message sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={recipient.profilePicture || undefined} alt={recipient.fullName} />
              <AvatarFallback className="bg-primary text-white text-sm">
                {getUserInitials(recipient.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{recipient.fullName}</span>
                {recipient.isVerified && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    <Heart className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-500">{recipient.bloodGroup} • {recipient.district}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Messages Area */}
          <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">Start your conversation</p>
              </div>
            ) : (
              messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      message.senderId === user?.id
                        ? 'bg-primary text-white'
                        : 'bg-white border'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              maxLength={1000}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-primary hover:bg-red-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Contact Options */}
          <div className="flex space-x-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Emergency Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}