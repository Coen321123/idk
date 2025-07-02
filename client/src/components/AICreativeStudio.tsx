import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Wand2, 
  Settings, 
  Code, 
  Eye, 
  Copy, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Lightbulb, 
  Trash2, 
  Moon, 
  Sun,
  Gamepad2,
  Globe,
  Info,
  TriangleAlert,
  CheckCircle,
  X
} from "lucide-react";
import { cn, debounce, downloadBlob } from "@/lib/utils";

declare global {
  interface Window {
    CodeMirror: any;
    JSZip: any;
  }
}

interface ExamplePrompt {
  title: string;
  description: string;
  prompt: string;
  type: 'game' | 'website';
  icon: string;
}

const examplePrompts: ExamplePrompt[] = [
  {
    title: "Space Invaders Clone",
    description: "Create a classic space invaders game with moving enemies, shooting mechanics, and score tracking. Use colorful pixel art style.",
    prompt: "Create a classic space invaders game with moving enemies, shooting mechanics, and score tracking. Use colorful pixel art style. Include player spaceship controls, enemy waves, collision detection, and a scoring system.",
    type: "game",
    icon: "🎮"
  },
  {
    title: "Memory Card Game", 
    description: "Create a memory card matching game with flip animations, timer, and difficulty levels. Use modern card design with smooth transitions.",
    prompt: "Create a memory card matching game with flip animations, timer, and difficulty levels. Use modern card design with smooth transitions. Include card shuffling, match detection, and win conditions.",
    type: "game",
    icon: "🎯"
  },
  {
    title: "Portfolio Website",
    description: "Build a modern portfolio website with dark theme, smooth animations, and responsive design for showcasing web development projects.",
    prompt: "Build a modern portfolio website with dark theme, smooth animations, and responsive design for showcasing web development projects. Include hero section, skills, projects gallery, and contact form.",
    type: "website", 
    icon: "🌐"
  },
  {
    title: "E-commerce Landing",
    description: "Design a product landing page with hero section, features grid, testimonials, and call-to-action. Modern and conversion-focused.",
    prompt: "Design a product landing page with hero section, features grid, testimonials, and call-to-action. Modern and conversion-focused. Include responsive design, gradient backgrounds, and smooth scrolling.",
    type: "website",
    icon: "🏪"
  }
];

export default function AICreativeStudio() {
  const [currentTab, setCurrentTab] = useState<'game' | 'website'>('game');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tempApiKey, setTempApiKey] = useState('');
  
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const codeMirrorRef = useRef<any>(null);
  const { toast } = useToast();

  // Load settings and last prompt on mount
  useEffect(() => {
    const defaultApiKey = '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';
    const savedApiKey = localStorage.getItem('groq_api_key') || defaultApiKey;
    const lastPrompt = localStorage.getItem('last_prompt') || '';
    setApiKey(savedApiKey);
    setTempApiKey(savedApiKey);
    setPrompt(lastPrompt);
    
    // Save default API key if none exists
    if (!localStorage.getItem('groq_api_key')) {
      localStorage.setItem('groq_api_key', defaultApiKey);
    }
    
    // Apply dark mode
    document.documentElement.classList.add('dark');
  }, []);

  // Initialize CodeMirror when code changes
  useEffect(() => {
    if (codeEditorRef.current && window.CodeMirror && generatedCode) {
      if (codeMirrorRef.current) {
        codeMirrorRef.current.toTextArea();
      }
      
      const textarea = document.createElement('textarea');
      textarea.value = generatedCode;
      codeEditorRef.current.innerHTML = '';
      codeEditorRef.current.appendChild(textarea);
      
      codeMirrorRef.current = window.CodeMirror.fromTextArea(textarea, {
        mode: 'htmlmixed',
        theme: 'material-darker',
        lineNumbers: true,
        readOnly: true,
        lineWrapping: true,
        viewportMargin: Infinity
      });
    }
  }, [generatedCode]);

  // Auto-save prompt
  const debouncedSavePrompt = debounce((value: string) => {
    localStorage.setItem('last_prompt', value);
  }, 500);

  useEffect(() => {
    if (prompt) {
      debouncedSavePrompt(prompt);
    }
  }, [prompt, debouncedSavePrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Error", 
        description: "Please set your Groq API key in settings",
        variant: "destructive",
      });
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: `Create a complete HTML file for: ${prompt}. Include all CSS and JavaScript inline. Make it fully functional and visually appealing. Return only the HTML code without any explanations.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const code = data.choices[0].message.content;
      
      setGeneratedCode(code);
      updatePreview(code);
      
      toast({
        title: "Success!",
        description: "Code generated successfully!",
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePreview = (code: string) => {
    if (previewRef.current) {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      previewRef.current.src = url;
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) {
      toast({
        title: "Error",
        description: "No code to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Success!",
        description: "Code copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedCode) {
      toast({
        title: "Error",
        description: "No code to download",
        variant: "destructive",
      });
      return;
    }

    if (!window.JSZip) {
      toast({
        title: "Error",
        description: "JSZip not loaded",
        variant: "destructive",
      });
      return;
    }

    const zip = new window.JSZip();
    zip.file('index.html', generatedCode);
    
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      downloadBlob(content, 'generated-project.zip');
      toast({
        title: "Success!",
        description: "Project downloaded!",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to create download",
        variant: "destructive",
      });
    });
  };

  const handleRefresh = () => {
    if (generatedCode) {
      updatePreview(generatedCode);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
    if (previewRef.current) {
      previewRef.current.src = '';
    }
    if (codeMirrorRef.current) {
      codeMirrorRef.current.toTextArea();
      codeMirrorRef.current = null;
    }
    localStorage.removeItem('last_prompt');
  };

  const handleSaveSettings = () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('groq_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setSettingsOpen(false);
    
    toast({
      title: "Success!",
      description: "Settings saved successfully!",
    });
  };

  const handleExampleClick = (example: ExamplePrompt) => {
    setPrompt(example.prompt);
    setCurrentTab(example.type);
    setExamplesOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Wand2 className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Creative Studio</h1>
              <p className="text-sm text-muted-foreground">Generate Games & Websites with AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-accent hover:bg-accent/80"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-accent hover:bg-accent/80"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Groq API Key <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your Groq API key"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="bg-accent border-border text-foreground placeholder-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Your API key is stored locally and never sent to our servers
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Model</label>
                    <Input
                      value="meta-llama/llama-4-scout-17b-16e-instruct"
                      disabled
                      className="bg-accent border-border text-muted-foreground"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleSaveSettings}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Save Settings
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSettingsOpen(false)}
                      className="border-border text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Type Tabs */}
        <div className="mb-8">
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'game' | 'website')}>
            <TabsList className="bg-card p-1 w-fit">
              <TabsTrigger 
                value="game" 
                className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Create Game
              </TabsTrigger>
              <TabsTrigger 
                value="website"
                className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="mr-2 h-4 w-4" />
                Create Website
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Input Section */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Describe Your Project</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExamplesOpen(!examplesOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Lightbulb className="mr-1 h-4 w-4" />
                  Examples
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`Describe your ${currentTab} in detail. For example: 'Create a space invaders game with colorful graphics and smooth controls' or 'Build a modern portfolio website with dark theme and smooth animations'`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-accent border-border text-foreground placeholder-muted-foreground resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground flex items-center">
                <Info className="mr-1 h-4 w-4" />
                Be as specific as possible for better results
              </span>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Examples Section */}
        {examplesOpen && (
          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                Example Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examplePrompts.map((example, index) => (
                  <Card
                    key={index}
                    className="bg-accent border-border cursor-pointer hover:bg-accent/80 transition-colors"
                    onClick={() => handleExampleClick(example)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{example.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">{example.title}</h4>
                          <p className="text-sm text-muted-foreground">{example.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {example.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Editor and Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center">
                  <Code className="mr-2 h-4 w-4 text-primary" />
                  Generated Code
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="text-muted-foreground hover:text-foreground"
                    title="Download project"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div 
                ref={codeEditorRef}
                className="h-96 bg-slate-900 text-slate-50 font-mono text-sm"
              >
                {!generatedCode && !isGenerating && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Code className="h-12 w-12 mb-4 opacity-50 mx-auto" />
                      <p>Your generated code will appear here</p>
                      <p className="text-sm mt-2">Enter a prompt above and click Generate to start</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4 mx-auto" />
                    <p className="text-muted-foreground">Generating code...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center">
                  <Eye className="mr-2 h-4 w-4 text-secondary" />
                  Live Preview
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    className="text-muted-foreground hover:text-foreground"
                    title="Refresh preview"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (previewRef.current?.src) {
                        window.open(previewRef.current.src, '_blank');
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="h-96 bg-white relative">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
                
                {/* Empty State */}
                {!generatedCode && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mb-4 opacity-50 mx-auto" />
                      <p>Live preview will appear here</p>
                      <p className="text-sm mt-2">Generate code to see your project come to life</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
