'use client';

import { Brain, FileText, MessageSquare, Zap, Shield, Sparkles, ArrowRight, Upload, Search, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to chat with new chat parameter
    router.push('/chat?new=true');
  };

  const handleViewExistingChats = () => {
    // Check if there are existing chats in localStorage
    const storedChats = localStorage.getItem('chat_history');
    if (storedChats) {
      try {
        const chats = JSON.parse(storedChats);
        if (Array.isArray(chats) && chats.length > 0) {
          // Navigate to chat page to view existing chats
          router.push('/chat');
          return;
        }
      } catch (e) {
        // Invalid JSON, create new chat
      }
    }
    // No existing chats, create a new one
    router.push('/chat?new=true');
  };

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: 'Upload PDFs',
      description: 'Simply drag and drop or click to upload your PDF documents. Supports multiple files at once.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced LangChain integration processes and understands your documents intelligently.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Natural Conversations',
      description: 'Ask questions in plain English and get accurate, context-aware responses.',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Retrieval',
      description: 'Our RAG system finds the most relevant information from your documents instantly.',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'Your documents stay secure. We process locally and never share your data.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Powered by Groq for ultra-fast responses. No more waiting around.',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const steps = [
    { step: '01', title: 'Upload', description: 'Drop your PDF files into the chat' },
    { step: '02', title: 'Process', description: 'AI analyzes and indexes your content' },
    { step: '03', title: 'Ask', description: 'Start asking questions naturally' },
    { step: '04', title: 'Learn', description: 'Get instant, accurate answers' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fadeInUp">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp animation-delay-200">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI-PDF Chatbot
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto animate-fadeInUp animation-delay-400">
            Transform your PDFs into{' '}
            <span className="text-blue-400 font-semibold">interactive conversations</span>.
            Upload, ask, and discover insights instantly with the power of AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp animation-delay-600">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 group"
            >
              Start New Chat
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={handleViewExistingChats}
              size="lg"
              variant="outline"
              className="border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:border-slate-500 group"
            >
              <FolderOpen className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              View Existing Chats
            </Button>
          </div>

          {/* Tech Stack */}
          <div className="mt-8 flex justify-center items-center gap-6 text-sm text-slate-500 animate-fadeInUp animation-delay-800">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Powered by LangChain
            </span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Groq Speed
            </span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              RAG Technology
            </span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-100">
            How It Works
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Get answers from your documents in four simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl font-bold text-blue-400 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-100">
            Powerful Features
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to interact with your PDFs intelligently
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-100">
            Powered by Advanced AI Models
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Choose the right model for your needs – from lightning-fast responses to deep PDF analysis
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Llama 3.3 70B */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Llama 3.3 70B</h3>
                  <span className="text-xs text-yellow-400 font-medium">RECOMMENDED</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Our most powerful model with 70 billion parameters. Excellent for complex PDF analysis, 
                multi-document reasoning, and detailed question answering. Best choice for professional use.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">PDF Analysis</span>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">Deep Reasoning</span>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">Best Quality</span>
              </div>
            </div>

            {/* Llama 3.1 8B */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Llama 3.1 8B</h3>
                  <span className="text-xs text-blue-400 font-medium">FAST</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Lightweight and fast model with 8 billion parameters. Great for quick general questions 
                and simple tasks. Limited PDF analysis capability – best for non-document queries.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">Fast Response</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">General Questions</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">Lightweight</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            All models are powered by <span className="text-cyan-400 font-medium">Groq</span> for blazing-fast inference
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 md:p-12">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex -space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center border-2 border-slate-800">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center border-2 border-slate-800">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center border-2 border-slate-800">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
                Ready to Transform Your PDFs?
              </h3>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of users who are already chatting with their documents.
                No signup required – just upload and start asking.
              </p>

              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Start Chatting Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AI-PDF Chatbot
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Built with LangChain, Groq, and Next.js
          </p>
          <div className="flex justify-center gap-6 text-sm text-slate-600">
            <a href="/" className="hover:text-blue-400 transition-colors">Home</a>
            <span>•</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">GitHub</a>
            <span>•</span>
            <a href="https://langchain.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">LangChain</a>
          </div>
          <p className="text-slate-600 text-xs mt-6">
            © 2026 AI-PDF Chatbot. Intelligence from Documents.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Developed by Nischith Adavala
          </p>
        </div>
      </footer>
    </div>
  );
}
