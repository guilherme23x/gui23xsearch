"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, Settings, Menu, X, MessageSquare, Moon, Sun, Download, Upload, Pin, Search, ArrowUpRightIcon } from 'lucide-react';
import Link from "next/link"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Interfaces TypeScript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
}

// Componente para renderizar mensagens com formatação
function MessageContent({ content }: { content: string }) {
  const renderContent = () => {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    // Processar blocos de código
    const codeBlocks = [];

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    if (codeBlocks.length === 0) {
      // Sem blocos de código, processar inline code e formatação
      return processInlineFormatting(content);
    }

    // Processar conteúdo com blocos de código
    codeBlocks.forEach((block, idx) => {
      // Adicionar texto antes do bloco
      if (block.start > lastIndex) {
        const textBefore = content.slice(lastIndex, block.start);
        parts.push(
          <span key={`text-${idx}`}>
            {processInlineFormatting(textBefore)}
          </span>
        );
      }

      // Adicionar bloco de código
      parts.push(
        <CodeBlock
          key={`code-${idx}`}
          language={block.language}
          code={block.code}
        />
      );

      lastIndex = block.end;
    });

    // Adicionar texto após o último bloco
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      parts.push(
        <span key="text-final">
          {processInlineFormatting(textAfter)}
        </span>
      );
    }

    return parts;
  };

  const processInlineFormatting = (text: string) => {
    const parts = [];
    const inlineCodeRegex = /`([^`]+)`/g;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;

    const replacements: Array<{ start: number; end: number; type: string; content: string }> = [];

    // Encontrar código inline
    let match;
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'code',
        content: match[1]
      });
    }

    // Encontrar negrito
    const boldMatches = text.matchAll(boldRegex);
    for (const match of boldMatches) {
      if (!replacements.some(r => match.index >= r.start && match.index < r.end)) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'bold',
          content: match[1]
        });
      }
    }

    // Encontrar itálico
    const italicMatches = text.matchAll(italicRegex);
    for (const match of italicMatches) {
      if (!replacements.some(r => match.index >= r.start && match.index < r.end)) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'italic',
          content: match[1]
        });
      }
    }

    if (replacements.length === 0) {
      return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    }

    replacements.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    replacements.forEach((replacement, idx) => {
      if (replacement.start > lastIndex) {
        const textBefore = text.slice(lastIndex, replacement.start);
        parts.push(
          <span key={`text-${idx}`}>
            {textBefore.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </span>
        );
      }

      if (replacement.type === 'code') {
        parts.push(
          <code key={`inline-${idx}`} className="bg-muted/50 px-1 py-0.5 rounded text-xs font-mono">
            {replacement.content}
          </code>
        );
      } else if (replacement.type === 'bold') {
        parts.push(<strong key={`bold-${idx}`}>{replacement.content}</strong>);
      } else if (replacement.type === 'italic') {
        parts.push(<em key={`italic-${idx}`}>{replacement.content}</em>);
      }

      lastIndex = replacement.end;
    });

    if (lastIndex < text.length) {
      const textAfter = text.slice(lastIndex);
      parts.push(
        <span key="final">
          {textAfter.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </span>
      );
    }

    return parts;
  };

  return <div className="whitespace-pre-wrap break-words">{renderContent()}</div>;
}

// Componente de bloco de código com botão de copiar
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-md bg-muted/50 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-6 w-6"
        >
          {copied ? (
            <span className="text-xs">✓</span>
          ) : (
            <span className="text-xs">📋</span>
          )}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto">
        <code className="text-xs font-mono">{code}</code>
      </pre>
    </div>
  );
}

export default function GeminiChatUI() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedConvs, setSelectedConvs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('system');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if mobile on mount and close sidebar
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedConvs = localStorage.getItem('gemini_conversations');
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedTheme = localStorage.getItem('gemini_theme');
    const savedSidebar = localStorage.getItem('gemini_sidebar');

    if (savedConvs) {
      const parsed: Conversation[] = JSON.parse(savedConvs);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConvId(parsed[0].id);
      }
    } else {
      const newId = Date.now().toString();
      setConversations([{ id: newId, title: 'Nova conversa', messages: [], pinned: false }]);
      setCurrentConvId(newId);
    }

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedTheme) setTheme(savedTheme);
    if (savedSidebar) setSidebarOpen(savedSidebar === 'true');
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('gemini_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save other settings
  useEffect(() => {
    localStorage.setItem('gemini_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gemini_sidebar', sidebarOpen.toString());
  }, [sidebarOpen]);

  const currentConv = conversations.find(c => c.id === currentConvId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConv?.messages]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const generateTitle = (message: string) => {
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const convIndex = conversations.findIndex(c => c.id === currentConvId);
    const updatedConv = { ...conversations[convIndex] };

    if (updatedConv.messages.length === 0) {
      updatedConv.title = generateTitle(input);
    }

    updatedConv.messages = [...updatedConv.messages, userMessage];

    const newConversations = [...conversations];
    newConversations[convIndex] = updatedConv;
    setConversations(newConversations);
    setInput('');
    setIsLoading(true);

    try {
      // Enviar histórico completo para manter contexto
      const contents = updatedConv.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        const aiMessage: Message = { role: 'assistant', content: aiResponse };

        updatedConv.messages = [...updatedConv.messages, aiMessage];
        newConversations[convIndex] = updatedConv;
        setConversations(newConversations);
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua API Key.'
      };
      updatedConv.messages = [...updatedConv.messages, errorMessage];
      newConversations[convIndex] = updatedConv;
      setConversations(newConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = { id: newId, title: 'Nova conversa', messages: [], pinned: false };
    setConversations([newConv, ...conversations]);
    setCurrentConvId(newId);
  };

  const deleteConversation = (id: string) => {
    if (conversations.length === 1) {
      const newId = Date.now().toString();
      setConversations([{ id: newId, title: 'Nova conversa', messages: [], pinned: false }]);
      setCurrentConvId(newId);
    } else {
      const filtered = conversations.filter(c => c.id !== id);
      setConversations(filtered);
      if (currentConvId === id) {
        setCurrentConvId(filtered[0].id);
      }
    }
  };

  const togglePin = (id: string) => {
    const newConversations = conversations.map(c =>
      c.id === id ? { ...c, pinned: !c.pinned } : c
    );
    setConversations(newConversations);
  };

  const clearAllConversations = () => {
    const newId = Date.now().toString();
    setConversations([{ id: newId, title: 'Nova conversa', messages: [], pinned: false }]);
    setCurrentConvId(newId);
  };

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('gemini_api_key', tempApiKey);
    setSettingsOpen(false);
  };

  const exportConversations = () => {
    const toExport = conversations.filter(c => selectedConvs.includes(c.id));
    const dataStr = JSON.stringify(toExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    setSelectedConvs([]);
  };

  const importConversations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const imported: Conversation[] = JSON.parse(result);
          if (Array.isArray(imported)) {
            setConversations([...conversations, ...imported]);
            setImportOpen(false);
          } else {
            alert('Formato de arquivo inválido');
          }
        }
      } catch (error) {
        alert('Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const filteredConversations = sortedConversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)] overflow-hidden">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-0'} fixed lg:relative z-50 lg:z-auto h-full transition-all duration-300 bg-background lg:bg-muted/30 border-r border-border ${sidebarOpen ? 'flex flex-col' : 'lg:hidden flex flex-col'}`}>
        <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="font-medium text-sm">Conversas</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewConversation}
            className="h-7 w-7"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="p-2 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 p-2 rounded-md mb-1 cursor-pointer hover:bg-muted ${currentConvId === conv.id ? 'bg-muted' : ''
                }`}
              onClick={() => {
                setCurrentConvId(conv.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{conv.title}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(conv.id);
                }}
                className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ${conv.pinned ? 'opacity-100' : ''}`}
              >
                <Pin className={`h-3 w-3 ${conv.pinned ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-border space-y-1 shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start h-8 text-sm"
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5 mr-2" /> : <Sun className="h-3.5 w-3.5 mr-2" />}
            {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          </Button>

          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-8 text-sm" size="sm">
                <Download className="h-3.5 w-3.5 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Exportar Conversas</DialogTitle>
                <DialogDescription className="text-sm">
                  Selecione as conversas para exportar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                <div className="h-64 border border-border rounded-md p-2 overflow-y-auto">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                      <Checkbox
                        id={conv.id}
                        checked={selectedConvs.includes(conv.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConvs([...selectedConvs, conv.id]);
                          } else {
                            setSelectedConvs(selectedConvs.filter(id => id !== conv.id));
                          }
                        }}
                      />
                      <label htmlFor={conv.id} className="text-sm flex-1 cursor-pointer">
                        {conv.title}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-sm"
                    onClick={() => {
                      if (selectedConvs.length === conversations.length) {
                        setSelectedConvs([]);
                      } else {
                        setSelectedConvs(conversations.map(c => c.id));
                      }
                    }}
                  >
                    {selectedConvs.length === conversations.length ? 'Desmarcar' : 'Selecionar'} tudo
                  </Button>
                  <Button
                    onClick={exportConversations}
                    disabled={selectedConvs.length === 0}
                    className="flex-1 h-9 text-sm"
                  >
                    Exportar ({selectedConvs.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-8 text-sm" size="sm">
                <Upload className="h-3.5 w-3.5 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-base">Importar Conversas</DialogTitle>
                <DialogDescription className="text-sm">
                  Selecione um arquivo JSON com conversas exportadas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importConversations}
                  className="h-9 text-sm"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-8 text-sm" size="sm">
                <Settings className="h-3.5 w-3.5 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-base">Configurações</DialogTitle>
                <DialogDescription className="text-sm">
                  Configure sua API Key do Gemini e gerencie suas conversas
                </DialogDescription>
                <div className="mt-2">
                  <Link className="flex gap-2" href="https://aistudio.google.com/api-keys" target="_blank">
                    <Button size="sm" variant="outline" >
                      Pegar API
                    </Button>
                    <Button size="icon-sm" aria-label="Submit" variant="outline">
                      <ArrowUpRightIcon />
                    </Button>
                  </Link>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apikey" className="text-sm">API Key do Gemini</Label>
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="Sua API Key"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <Button onClick={saveApiKey} className="w-full h-9 text-sm" variant="secondary">
                  Salvar API Key
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearAllConversations();
                    setSettingsOpen(false);
                  }}
                  className="w-full h-9 text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Limpar todas as conversas
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          {currentConv?.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Comece uma nova conversa</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentConv?.messages.map((msg: Message, idx: number) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                      ? 'bg-outline'
                      : 'bg-muted'
                      }`}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="min-h-12 max-h-[200px] resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-12 w-12 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
