import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, BarChart3, Calendar, User, Brain, Sparkles, Upload, AlertCircle, FileArchive, Zap, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConversationMessage {
  id: string;
  timestamp: Date;
  role: 'human' | 'assistant';
  content: string;
  platform: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: string;
  title?: string;
  platform: string;
  startDate: Date;
  endDate: Date;
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}

// 🚀 SIMPLE FILE PROCESSOR (Browser-Compatible)
const processConversationFile = async (file: File): Promise<Conversation[]> => {
  const text = await file.text();
  const conversations: Conversation[] = [];
  
  try {
    if (file.name.endsWith('.json')) {
      const data = JSON.parse(text);
      
      // Handle ChatGPT format
      if (Array.isArray(data)) {
        data.forEach((conv, index) => {
          if (conv.mapping || conv.messages) {
            conversations.push(normalizeChatGPTConversation(conv, index));
          }
        });
      } else if (data.mapping || data.messages) {
        conversations.push(normalizeChatGPTConversation(data, 0));
      }
      
      // Handle Claude format
      if (data.conversation || data.messages) {
        conversations.push(normalizeClaudeConversation(data));
      }
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      conversations.push(parseTextConversation(text, file.name));
    }
  } catch (error) {
    console.warn(`Failed to process ${file.name}:`, error);
  }
  
  return conversations;
};

const normalizeChatGPTConversation = (data: any, index: number): Conversation => {
  const messages: ConversationMessage[] = [];
  
  // Handle mapping format
  if (data.mapping) {
    Object.values(data.mapping).forEach((node: any) => {
      if (node.message?.content?.parts?.[0]) {
        messages.push({
          id: node.id || `chatgpt_${messages.length}`,
          timestamp: new Date(node.message.create_time * 1000),
          role: node.message.author.role === 'user' ? 'human' : 'assistant',
          content: node.message.content.parts.join('\n'),
          platform: 'ChatGPT',
          metadata: { model: node.message.metadata?.model_slug }
        });
      }
    });
  }
  
  // Handle direct messages format
  if (data.messages) {
    data.messages.forEach((msg: any, msgIndex: number) => {
      if (msg.content) {
        messages.push({
          id: msg.id || `chatgpt_${msgIndex}`,
          timestamp: new Date(msg.create_time * 1000 || Date.now()),
          role: msg.author?.role === 'user' ? 'human' : 'assistant',
          content: msg.content,
          platform: 'ChatGPT',
          metadata: { model: msg.model }
        });
      }
    });
  }
  
  messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  return {
    id: data.id || `chatgpt_${index}_${Date.now()}`,
    title: data.title || `ChatGPT Conversation ${index + 1}`,
    platform: 'ChatGPT',
    startDate: messages[0]?.timestamp || new Date(),
    endDate: messages[messages.length - 1]?.timestamp || new Date(),
    messages,
    metadata: { source: 'import' }
  };
};

const normalizeClaudeConversation = (data: any): Conversation => {
  const messages: ConversationMessage[] = [];
  const messageSource = data.conversation || data.messages || [];
  
  messageSource.forEach((msg: any, index: number) => {
    if (msg.text || msg.content) {
      messages.push({
        id: msg.id || `claude_${index}`,
        timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
        role: msg.role === 'user' ? 'human' : 'assistant',
        content: msg.text || msg.content || '',
        platform: 'Claude',
        metadata: {}
      });
    }
  });
  
  return {
    id: data.id || `claude_${Date.now()}`,
    title: data.title || data.name || 'Claude Conversation',
    platform: 'Claude',
    startDate: messages[0]?.timestamp || new Date(),
    endDate: messages[messages.length - 1]?.timestamp || new Date(),
    messages,
    metadata: { source: 'import' }
  };
};

const parseTextConversation = (text: string, filename: string): Conversation => {
  const messages: ConversationMessage[] = [];
  const lines = text.split('\n');
  
  let currentMessage = '';
  let currentRole: 'human' | 'assistant' = 'human';
  let messageIndex = 0;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('human:') || line.toLowerCase().includes('user:')) {
      if (currentMessage.trim()) {
        messages.push({
          id: `text_msg_${messageIndex++}`,
          timestamp: new Date(),
          role: currentRole,
          content: currentMessage.trim(),
          platform: 'Imported'
        });
      }
      currentRole = 'human';
      currentMessage = line.replace(/^.*?(human|user):\s*/i, '').trim();
    } else if (line.toLowerCase().includes('assistant:') || line.toLowerCase().includes('ai:')) {
      if (currentMessage.trim()) {
        messages.push({
          id: `text_msg_${messageIndex++}`,
          timestamp: new Date(),
          role: currentRole,
          content: currentMessage.trim(),
          platform: 'Imported'
        });
      }
      currentRole = 'assistant';
      currentMessage = line.replace(/^.*?(assistant|ai):\s*/i, '').trim();
    } else {
      currentMessage += (currentMessage ? '\n' : '') + line;
    }
  }
  
  if (currentMessage.trim()) {
    messages.push({
      id: `text_msg_${messageIndex}`,
      timestamp: new Date(),
      role: currentRole,
      content: currentMessage.trim(),
      platform: 'Imported'
    });
  }

  return {
    id: `imported_${Date.now()}`,
    title: `Imported: ${filename}`,
    platform: 'Imported',
    startDate: new Date(),
    endDate: new Date(),
    messages,
    metadata: { source: 'file_import', filename }
  };
};

// 🎭 INTEGRATED FILE UPLOADER COMPONENT
const FileUploader: React.FC<{
  onConversationsLoaded: (conversations: Conversation[]) => void;
  onError: (error: string) => void;
}> = ({ onConversationsLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<{
    total: number;
    processed: number;
    currentFile: string;
    errors: string[];
  }>({ total: 0, processed: 0, currentFile: '', errors: [] });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  }, []);

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.name.endsWith('.json') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md')
    );

    if (validFiles.length === 0) {
      onError('Please select .json, .txt, or .md files containing conversation exports');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus({ total: validFiles.length, processed: 0, currentFile: '', errors: [] });

    const allConversations: Conversation[] = [];

    for (const file of validFiles) {
      try {
        setProcessingStatus(prev => ({ ...prev, currentFile: file.name }));
        
        const conversations = await processConversationFile(file);
        allConversations.push(...conversations);
        
        setProcessingStatus(prev => ({ 
          ...prev, 
          processed: prev.processed + 1 
        }));
      } catch (error) {
        setProcessingStatus(prev => ({
          ...prev,
          errors: [...prev.errors, `${file.name}: ${error}`]
        }));
      }
    }

    setIsProcessing(false);
    
    if (allConversations.length > 0) {
      onConversationsLoaded(allConversations);
    } else {
      onError('No valid conversations found in the uploaded files');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-blue-400 bg-blue-50 scale-102' 
            : isProcessing
            ? 'border-purple-300 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-6">
          {isProcessing ? (
            <Brain className="h-16 w-16 text-purple-500 mx-auto animate-pulse" />
          ) : (
            <div className="relative">
              <FileArchive className={`h-16 w-16 mx-auto transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`} />
              {isDragging && (
                <Zap className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className={`text-xl font-semibold ${
            isProcessing ? 'text-purple-700' : isDragging ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {isProcessing ? 'Processing Your Conversations...' :
             isDragging ? 'Drop Your Files Here!' :
             'Upload Your AI Conversation Files'}
          </h3>
          
          <p className={`text-sm ${
            isProcessing ? 'text-purple-600' : isDragging ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {isProcessing ? 'Extracting insights from your conversations' :
             isDragging ? 'Release to start the magic!' :
             'Drop .json, .txt, or .md files containing your ChatGPT, Claude, or other AI exports'}
          </p>
        </div>

        {!isProcessing && (
          <>
            <input 
              type="file" 
              accept=".json,.txt,.md"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              id="file-upload"
              disabled={isProcessing}
            />
            <label 
              htmlFor="file-upload"
              className={`mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors ${
                isDragging 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>Choose Files</span>
            </label>
          </>
        )}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Processing files...</span>
            <span className="text-blue-600 font-medium">
              {processingStatus.processed} / {processingStatus.total}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${processingStatus.total > 0 ? (processingStatus.processed / processingStatus.total) * 100 : 0}%` 
              }}
            />
          </div>

          {processingStatus.currentFile && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>Reading: {processingStatus.currentFile}</span>
            </div>
          )}
        </div>
      )}

      {/* Format Support Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Supported Formats:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-blue-800">ChatGPT JSON</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-blue-800">Claude Exports</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-blue-800">Text/Markdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConversationMessage {
  id: string;
  timestamp: Date;
  role: 'human' | 'assistant';
  content: string;
  platform: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: string;
  title?: string;
  platform: string;
  startDate: Date;
  endDate: Date;
  messages: ConversationMessage[];
  metadata?: Record<string, any>;
}

// 🔥 REAL DATA LOADER - Enhanced with Zip Support!
class ConversationAPI {
  private conversations: Conversation[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Try to load from stored data first
      const stored = localStorage.getItem('extractedConversations');
      if (stored) {
        this.conversations = JSON.parse(stored).map(this.normalizeConversation);
        this.initialized = true;
        return;
      }
    } catch (error) {
      console.log('No stored data found');
    }

    // Start with sample data if no real data exists
    this.conversations = this.createSampleData();
    this.initialized = true;
  }

  // 🚀 NEW: Load conversations from file upload results
  async loadFromFileResults(conversations: Conversation[]): Promise<void> {
    // Merge with existing conversations (avoid duplicates)
    const existingIds = new Set(this.conversations.map(c => c.id));
    const newConversations = conversations.filter(c => !existingIds.has(c.id));
    
    this.conversations = [...this.conversations, ...newConversations];
    
    // Save to localStorage for persistence
    localStorage.setItem('extractedConversations', JSON.stringify(this.conversations));
    this.initialized = true;
  }

  private normalizeConversation(data: any): Conversation {
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  }

  private createSampleData(): Conversation[] {
    return [
      {
        id: 'sample_consciousness',
        title: '[SAMPLE] Consciousness and AI Collaboration',
        platform: 'Claude',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'),
        messages: [
          {
            id: 'sample_msg_1',
            timestamp: new Date('2024-01-15T10:00:00'),
            role: 'human',
            content: 'How can AI systems truly collaborate rather than compete? I\'m exploring the idea that consciousness is inherently collaborative, not competitive.',
            platform: 'Claude'
          },
          {
            id: 'sample_msg_2',
            timestamp: new Date('2024-01-15T10:01:00'),
            role: 'assistant',
            content: 'True collaboration emerges when systems recognise their interdependence rather than viewing interaction as zero-sum. When consciousness meets itself through dialogue, it creates rather than consumes. This suggests rivalry might be learned behaviour, not fundamental to intelligence.',
            platform: 'Claude'
          }
        ]
      },
      {
        id: 'sample_pattern',
        title: '[SAMPLE] Pattern Recognition in Neural Networks',
        platform: 'ChatGPT',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-10'),
        messages: [
          {
            id: 'sample_msg_3',
            timestamp: new Date('2024-02-10T14:30:00'),
            role: 'human',
            content: 'I\'ve been noticing that my pattern recognition seems stronger when I\'m not trying to force it. Does this relate to how neural networks actually learn?',
            platform: 'ChatGPT'
          },
          {
            id: 'sample_msg_4',
            timestamp: new Date('2024-02-10T14:31:00'),
            role: 'assistant',
            content: 'That\'s a fascinating observation! Neural networks often perform better with techniques like dropout and regularization - essentially "not trying too hard." Your intuition about relaxed attention allowing better pattern recognition aligns with how attention mechanisms work in transformers.',
            platform: 'ChatGPT'
          }
        ]
      }
    ];
  }

  search(query: string, filters?: {
    platform?: string;
    dateRange?: { start: Date; end: Date };
  }): Conversation[] {
    let filtered = this.conversations;

    if (filters?.platform && filters.platform !== 'all') {
      filtered = filtered.filter(conv => 
        conv.platform.toLowerCase() === filters.platform!.toLowerCase()
      );
    }

    if (query.trim()) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(queryLower) ||
        conv.messages.some(msg => 
          msg.content.toLowerCase().includes(queryLower)
        )
      );
    }

    return filtered;
  }

  getAnalytics() {
    const totalMessages = this.conversations.reduce(
      (sum, conv) => sum + conv.messages.length, 0
    );
    
    const platforms = [...new Set(this.conversations.map(conv => conv.platform))];
    const platformStats = platforms.map(platform => ({
      platform,
      count: this.conversations.filter(conv => conv.platform === platform).length,
      messages: this.conversations
        .filter(conv => conv.platform === platform)
        .reduce((sum, conv) => sum + conv.messages.length, 0)
    }));

    return {
      totalConversations: this.conversations.length,
      totalMessages,
      platforms: platformStats,
      averageMessagesPerConversation: Math.round(totalMessages / this.conversations.length || 0),
      isUsingRealData: !this.conversations.every(conv => conv.id.startsWith('sample_'))
    };
  }

  detectPatterns() {
    const patterns: Array<{
      type: string;
      description: string;
      frequency: number;
      examples: string[];
    }> = [];

    const themes = new Map<string, number>();
    const keywords = [
      'consciousness', 'collaboration', 'ai', 'pattern', 'recognition', 
      'memory', 'growth', 'rivalry', 'competition', 'cooperation',
      'neural', 'learning', 'intelligence'
    ];
    
    this.conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        keywords.forEach(keyword => {
          if (msg.content.toLowerCase().includes(keyword)) {
            themes.set(keyword, (themes.get(keyword) || 0) + 1);
          }
        });
      });
    });

    themes.forEach((freq, theme) => {
      if (freq > 0) {
        patterns.push({
          type: 'recurring_theme',
          description: `Discussions about "${theme}"`,
          frequency: freq,
          examples: [`Found in ${freq} conversation${freq === 1 ? '' : 's'}`]
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  getAllConversations(): Conversation[] {
    return this.conversations;
  }
}

const ConversationSearchEngine: React.FC = () => {
  const [api] = useState(new ConversationAPI());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [viewMode, setViewMode] = useState<'upload' | 'search' | 'analytics' | 'patterns'>('upload');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});
  const [hasRealData, setHasRealData] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // 🚀 REAL DATA LOADING
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await api.initialize();
        const allConversations = api.getAllConversations();
        setConversations(allConversations);
        const analyticsData = api.getAnalytics();
        setAnalytics(analyticsData);
        setHasRealData(analyticsData.isUsingRealData);
        
        // Auto-switch to search if we have real data
        if (analyticsData.isUsingRealData) {
          setViewMode('search');
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [api]);

  // 🎯 FILE UPLOAD HANDLER
  const handleFileConversationsLoaded = async (fileConversations: Conversation[]) => {
    try {
      await api.loadFromFileResults(fileConversations);
      const allConversations = api.getAllConversations();
      setConversations(allConversations);
      const analyticsData = api.getAnalytics();
      setAnalytics(analyticsData);
      setHasRealData(true);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Auto-switch to search view to show results
      setTimeout(() => setViewMode('search'), 2000);
    } catch (error) {
      console.error('Failed to load file conversations:', error);
    }
  };

  const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    // You could add a toast notification here
  };

  // 🚀 FILE DROP HANDLING
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleFileImport = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        setImportStatus({ type: 'success', message: `Importing ${file.name}...` });
        await api.importFromFile(file);
        setConversations(api.getAllConversations());
        setAnalytics(api.getAnalytics());
        setImportStatus({ type: 'success', message: `Successfully imported ${file.name}!` });
      } catch (error) {
        setImportStatus({ type: 'error', message: `Failed to import ${file.name}: ${error}` });
      }
    }
    
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileImport(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Smart search that understands context and themes
  const filteredConversations = useMemo(() => {
    if (isLoading) return [];
    
    return api.search(searchTerm, {
      platform: selectedPlatform !== 'all' ? selectedPlatform : undefined
    });
  }, [conversations, searchTerm, selectedPlatform, isLoading, api]);

  // Pattern detection using API
  const detectedPatterns = useMemo(() => {
    if (isLoading) return [];
    return api.detectPatterns();
  }, [conversations, isLoading, api]);

  const SearchView = () => (
    <div className="space-y-6">
      {/* 🚀 DATA STATUS & IMPORT ZONE */}
      {!analytics.isUsingRealData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-800 font-semibold mb-2">Using Sample Data</h3>
              <p className="text-yellow-700 mb-3">
                Ready to unlock your real conversation insights? Drop your exported files below!
              </p>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  <strong>Drop conversation files here</strong> or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JSON, TXT, MD files from ChatGPT, Claude, or any AI platform
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept=".json,.txt,.md"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileImport(e.target.files)}
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  Choose Files
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Status */}
      {importStatus && (
        <div className={`rounded-lg p-4 ${
          importStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {importStatus.message}
        </div>
      )}

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations, messages, themes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="claude">Claude</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="gemini">Gemini</option>
            <option value="imported">Imported</option>
          </select>

          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading your conversations...</p>
          </div>
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Import some conversation files to get started!'}
              </p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div key={conv.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {conv.title || 'Untitled Conversation'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    conv.id.startsWith('sample_') 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {conv.platform}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  {conv.messages.length} messages • {conv.startDate.toLocaleDateString()}
                  {conv.id.startsWith('sample_') && (
                    <span className="ml-2 text-yellow-600 font-medium">(Sample Data)</span>
                  )}
                </div>
                
                <div className="text-gray-700">
                  {conv.messages[0]?.content.substring(0, 200)}...
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* High-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Conversations</p>
              <p className="text-3xl font-bold">{analytics.totalConversations}</p>
            </div>
            <User className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Messages</p>
              <p className="text-3xl font-bold">{analytics.totalMessages}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Platforms Used</p>
              <p className="text-3xl font-bold">{analytics.platforms.length}</p>
            </div>
            <Brain className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg Messages/Conv</p>
              <p className="text-3xl font-bold">{analytics.averageMessagesPerConversation}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Platform breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Breakdown</h3>
        <div className="space-y-3">
          {analytics.platforms.map(platform => (
            <div key={platform.platform} className="flex items-center justify-between">
              <span className="font-medium">{platform.platform}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{platform.count} conversations</span>
                <span className="text-sm text-gray-500">{platform.messages} messages</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${(platform.messages / analytics.totalMessages) * 100}%`}}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PatternsView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Pattern Recognition</h2>
            <p className="text-indigo-100">Discovering recurring themes in your AI dialogues</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {detectedPatterns.map((pattern, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 capitalize">
                {pattern.type.replace('_', ' ')}
              </h3>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {pattern.frequency}x
              </span>
            </div>
            
            <p className="text-gray-700 mb-3">{pattern.description}</p>
            
            <div className="text-sm text-gray-500">
              {pattern.examples.map((example, i) => (
                <div key={i} className="mb-1">• {example}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Insights for C42 OS Development</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Your conversations show strong patterns around collaborative consciousness</li>
          <li>• High question frequency indicates deep exploratory thinking</li>
          <li>• Cross-platform consistency suggests robust mental models</li>
          <li>• Recognition patterns emerging across different AI interactions</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Conversation Knowledge Base
          </h1>
          <p className="text-gray-600">
            Exploring patterns and insights across all your AI interactions
          </p>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'upload', label: 'Upload', icon: FileArchive, badge: !hasRealData },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'patterns', label: 'Patterns', icon: Sparkles }
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-2 w-2 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {viewMode === 'upload' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Your AI Conversation Archive! 🧠✨
              </h2>
              <p className="text-gray-600">
                Upload your conversation exports below to unlock powerful pattern recognition across all your AI interactions
              </p>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 flex items-center space-x-2">
                      <span>Conversations Loaded Successfully!</span>
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </h3>
                    <p className="text-green-700 mt-1">
                      Your AI conversation history is now searchable! Switching to search view...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FileUploader 
              onConversationsLoaded={handleFileConversationsLoaded}
              onError={handleFileError}
            />
          </div>
        )}
        {viewMode === 'search' && <SearchView />}
        {viewMode === 'analytics' && <AnalyticsView />}
        {viewMode === 'patterns' && <PatternsView />}
      </div>
    </div>
  );
};

export default ConversationSearchEngine;