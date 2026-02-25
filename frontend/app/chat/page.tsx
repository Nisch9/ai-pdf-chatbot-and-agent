'use client';

import type React from 'react';

import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, ArrowUp, Loader2 } from 'lucide-react';
import { ExamplePrompts } from '@/components/example-prompts';
import { ChatMessage } from '@/components/chat-message';
import { FilePreview } from '@/components/file-preview';
import { ChatSidebar } from '@/components/chat-sidebar';
import { Navbar } from '@/components/navbar';
import { useNotifications } from '@/components/notification-provider';
import { useChatHistory, ChatSession, FileMetadata, fileToMetadataWithPreview } from '@/hooks/use-chat-history';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { client } from '@/lib/langgraph-client';
import {
  PDFDocument,
  RetrieveDocumentsNodeUpdates,
} from '@/types/graphTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModelSelector, AVAILABLE_MODELS } from '@/components/model-selector';

export default function Home() {
  const { toast } = useToast();
  const { addNotification, updateNotification, removeNotification } = useNotifications();
  const {
    chats,
    activeChatId,
    activeChat,
    createChat,
    updateActiveChat,
    deleteChat,
    switchChat,
    renameChat,
    togglePinChat,
    isLoaded,
  } = useChatHistory();

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDragHover, setIsDragHover] = useState(false);
  const [fileToRemove, setFileToRemove] = useState<FileMetadata | null>(null);
  const [removeFileDialogOpen, setRemoveFileDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRetrievedDocsRef = useRef<PDFDocument[]>([]);
  const messagesRef = useRef<ChatSession['messages']>([]);

  // Keep messagesRef in sync with activeChat
  useEffect(() => {
    if (activeChat) {
      messagesRef.current = activeChat.messages;
    }
  }, [activeChat?.messages]);

  // Auto-create chat if none exist
  useEffect(() => {
    if (isLoaded && chats.length === 0) {
      createChat();
    }
  }, [isLoaded, chats.length]);

  // Handle new chat from URL parameter
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        createChat();
        // Clean up URL without refresh
        window.history.replaceState({}, '', '/chat');
      }
    }
  }, [isLoaded]);

  // Create thread for active chat if needed
  useEffect(() => {
    if (!activeChat || activeChat.threadId) return;
    if (!client) {
      toast({
        title: 'Configuration Error',
        description: 'NEXT_PUBLIC_LANGGRAPH_API_URL is not configured. Please set it in your environment variables.',
        variant: 'destructive',
      });
      return;
    }

    const initThread = async () => {
      if (!client) return;
      try {
        const thread = await client.createThread();
        updateActiveChat({ threadId: thread.thread_id });
      } catch (error) {
        console.error('Error creating thread:', error);
        toast({
          title: 'Error',
          description:
            'Error creating thread. Please check LANGGRAPH_API_URL. ' +
            (error instanceof Error ? error.message : ''),
          variant: 'destructive',
        });
      }
    };
    initThread();
  }, [activeChat?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onNewChat: () => createChat(),
    onEscape: () => setSearchOpen(false),
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat?.threadId || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = input.trim();
    const timestamp = Date.now();
    const newMessages = [
      ...activeChat.messages,
      { role: 'user' as const, content: userMessage, sources: undefined, timestamp },
      { role: 'assistant' as const, content: '', sources: undefined, timestamp },
    ];
    
    // Sync messagesRef immediately before streaming starts (don't wait for useEffect)
    messagesRef.current = newMessages;
    updateActiveChat({ messages: newMessages });
    setInput('');
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    lastRetrievedDocsRef.current = [];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: activeChat.threadId,
          queryModel: selectedModel,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const sseString = line.slice('data: '.length);
          let sseEvent: { event: string; data: unknown };
          try {
            sseEvent = JSON.parse(sseString);
          } catch (err) {
            console.error('Error parsing SSE line:', err, line);
            continue;
          }

          const { event, data } = sseEvent;

          if (event === 'error') {
            console.error('Streaming error: ', data);
            throw new Error((data as { error?: string })?.error || 'Unknown streaming error');
          }

          if (event === 'messages/partial') {
            if (Array.isArray(data)) {
              const lastObj = data[data.length - 1];
              if (lastObj?.type === 'ai') {
                const partialContent = lastObj.content ?? '';

                if (
                  typeof partialContent === 'string' &&
                  !partialContent.startsWith('{')
                ) {
                  const currentMessages = messagesRef.current || [];
                  const updatedMessages = currentMessages.map((msg: typeof activeChat.messages[0], idx: number) => {
                    if (idx === currentMessages.length - 1 && msg.role === 'assistant') {
                      return {
                        ...msg,
                        content: partialContent,
                        sources: lastRetrievedDocsRef.current,
                      };
                    }
                    return msg;
                  });
                  
                  // Sync ref immediately so next streaming event has latest state
                  messagesRef.current = updatedMessages;
                  updateActiveChat({ messages: updatedMessages });
                }
              }
            }
          } else if (event === 'updates' && data) {
            if (
              data &&
              typeof data === 'object' &&
              'retrieveDocuments' in data &&
              data.retrieveDocuments &&
              Array.isArray(data.retrieveDocuments.documents)
            ) {
              const retrievedDocs = (data as RetrieveDocumentsNodeUpdates)
                .retrieveDocuments.documents as PDFDocument[];
              lastRetrievedDocsRef.current = retrievedDocs;
              console.log('Retrieved documents:', retrievedDocs);
            } else {
              lastRetrievedDocsRef.current = [];
            }
          } else if (event !== 'messages/update') {
            console.log('Unknown SSE event:', event, data);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isThreadError = errorMessage.includes('already running a task');
      
      toast({
        title: 'Error',
        description: isThreadError 
          ? 'Please wait for the previous message to finish processing before sending another.'
          : 'Failed to send message. Please try again.\n' + errorMessage,
        variant: 'destructive',
      });
      
      const currentMessages = messagesRef.current || [];
      if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].role === 'assistant') {
        const updatedMessages = currentMessages.map((msg: ChatSession['messages'][0], idx: number) => {
          if (idx === currentMessages.length - 1 && msg.role === 'assistant') {
            // Only update if the message is empty (hasn't started receiving data)
            if (msg.content === '') {
              return {
                ...msg,
                content: isThreadError
                  ? '⏳ Please wait for the previous response to complete.'
                  : '❌ ' + errorMessage,
              };
            }
          }
          return msg;
        });
        
        updateActiveChat({ messages: updatedMessages });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      // Small delay to ensure thread finishes processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const nonPdfFiles = selectedFiles.filter(
      (file) => file.type !== 'application/pdf',
    );
    if (nonPdfFiles.length > 0) {
      addNotification({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please upload PDF files only',
      });
      return;
    }

    setIsUploading(true);
    const fileNames = selectedFiles.map(f => f.name).join(', ');
    const notificationId = addNotification({
      type: 'loading',
      title: 'Uploading files...',
      message: fileNames.length > 40 ? fileNames.substring(0, 40) + '...' : fileNames,
      progress: 0,
    });

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Add threadId to form data
      if (activeChat?.threadId) {
        formData.append('threadId', activeChat.threadId);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        updateNotification(notificationId, {
          progress: Math.min(90, (Math.random() * 20) + 30),
        });
      }, 500);

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload files');
      }

      // Convert files to metadata with preview data URLs
      const newFileMetadata = await Promise.all(
        selectedFiles.map(file => fileToMetadataWithPreview(file))
      );

      if (activeChat) {
        updateActiveChat({
          fileMetadata: [
            ...activeChat.fileMetadata,
            ...newFileMetadata,
          ],
        });
      }

      removeNotification(notificationId);
      addNotification({
        type: 'success',
        title: 'Upload complete',
        message: `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      removeNotification(notificationId);
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragHover(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragHover(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragHover(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: 'No PDF files found',
        description: 'Please drop PDF files only',
        variant: 'destructive',
      });
      return;
    }

    if (files.length > pdfFiles.length) {
      toast({
        title: 'Some files were ignored',
        description: 'Only PDF files are supported',
        variant: 'destructive',
      });
    }

    // Trigger the same upload logic as file input
    const event = {
      target: {
        files: pdfFiles,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    await handleFileUpload(event);
  };

  const handleRemoveFile = (fileMetadata: FileMetadata) => {
    setFileToRemove(fileMetadata);
    setRemoveFileDialogOpen(true);
  };

  const confirmRemoveFile = () => {
    if (!fileToRemove || !activeChat) return;
    
    updateActiveChat({
      fileMetadata: activeChat.fileMetadata.filter((meta) => meta.name !== fileToRemove.name),
    });
    addNotification({
      type: 'success',
      title: 'File removed',
      message: `${fileToRemove.name} has been removed`,
    });
    setFileToRemove(null);
    setRemoveFileDialogOpen(false);
  };

  if (!isLoaded || !activeChat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-neutral-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar chats={chats} onSelectChat={switchChat} searchOpen={searchOpen} onSearchOpenChange={setSearchOpen} selectedModel={selectedModel} />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onTogglePinChat={togglePinChat}
      />

      <main 
        className={`flex min-h-screen flex-col items-center p-4 md:p-24 max-w-5xl mx-auto w-full relative z-10 ml-64 pt-16 transition-colors ${
          isDragHover ? 'bg-blue-500/5' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {activeChat.messages.length === 0 ? (
          <>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fadeInUp">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent mb-6">
                  AI PDF Chatbot
                </h1>
                <p className="font-medium text-muted-foreground max-w-md mx-auto mb-6">
                  Upload a PDF document and ask questions about its content.
                  Powered by LangChain and Groq.
                </p>
                <div className="flex justify-center">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                  />
                </div>
              </div>
            </div>
            <div className="mb-40">
              <ExamplePrompts onPromptSelect={setInput} />
            </div>
          </>
        ) : (
          <div className="w-full space-y-4 mb-20 animate-fadeInUp">
            {activeChat.messages.map((message, i) => (
              <div key={i} className="animate-slideInFromBottom">
                <ChatMessage message={message} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="fixed bottom-0 left-64 right-0 p-4 glass-effect border-t border-slate-700">
          <div className="max-w-5xl mx-auto space-y-4">
            {(activeChat.fileMetadata?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-2 animate-fadeInUp">
                {activeChat.fileMetadata?.map((metadata, index) => (
                  <div key={`${metadata.name}-${index}`} className="animate-slideInFromBottom">
                    <FilePreview
                      fileName={metadata.name}
                      fileUrl={metadata.dataUrl}
                      onRemove={() => handleRemoveFile(metadata)}
                    />
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ModelSelector
                  selectedModel={selectedModel}
                  onSelectModel={setSelectedModel}
                />
              </div>
              <div className="flex gap-2 border rounded-lg overflow-hidden glass-effect-light hover:border-slate-500 transition-colors duration-300">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-12 hover:bg-slate-700/50 transition-colors duration-300"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : (
                    <Paperclip className="h-4 w-4 text-slate-400 hover:text-slate-200" />
                  )}
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isUploading ? 'Uploading PDF...' : 'Send a message...'
                  }
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 bg-transparent text-slate-100 placeholder:text-slate-500 focus:bg-slate-800/30 transition-colors duration-300"
                  disabled={isUploading || isLoading || !activeChat.threadId}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-none h-12 hover:bg-slate-700/50 transition-colors duration-300"
                  disabled={
                    !input.trim() ||
                    isUploading ||
                    isLoading ||
                    !activeChat.threadId
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Remove File Confirmation Dialog */}
      <AlertDialog open={removeFileDialogOpen} onOpenChange={setRemoveFileDialogOpen}>
        <AlertDialogContent className="glass-effect border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Remove File</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to remove <span className="font-semibold text-slate-300">"{fileToRemove?.name}"</span>? 
              The file will no longer be available for this chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600"
              onClick={() => {
                setFileToRemove(null);
                setRemoveFileDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
