import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Shield, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Loader from 'ui/Loader';

interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  senderName?: string;
}

interface MessagingCenterProps {
  userId: number;
  recipientId?: number;
  recipientName?: string;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  userId,
  recipientId,
  recipientName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else if (response.status === 401) {
        toast({
          title: "Please login",
          description: "You need to be logged in to view messages",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !recipientId) return;

    try {
      setSending(true);
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: recipientId,
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        toast({
          title: "Message sent",
          description: "Your message has been delivered"
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <Loader />
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-96 flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={20} />
            {recipientName ? `Conversation with ${recipientName}` : 'Messages'}
          </CardTitle>
          {recipientId && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield size={14} />
              Private and secure messaging
            </div>
          )}
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {recipientId ? 'No messages yet. Start the conversation!' : 'No messages to display'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.senderId === userId ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${
                      message.senderId === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex items-start gap-2 max-w-[70%] ${
                      message.senderId === userId ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {message.senderId === userId ? 'You' : getInitials(message.senderName || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`p-3 rounded-lg ${
                        message.senderId === userId
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          message.senderId === userId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <Clock size={10} />
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Message Input */}
        {recipientId && (
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="resize-none min-h-[40px] max-h-[100px]"
                disabled={sending}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="self-end"
              >
                <Send size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Shield size={10} />
              Your messages are encrypted and private
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};