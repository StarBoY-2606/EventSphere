import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Tag, Laugh, Database, PlayCircle, Share2, Globe, FileCode, CheckCircle, Mail, Send } from "lucide-react";
import { EventSphereLogo } from "./EventSphereLogo";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-ink text-on-surface overflow-x-hidden selection:bg-primary/30">
      {/* Header navbar */}
      <header className="fixed top-0 w-full z-50 bg-ink/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-12 h-16">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <EventSphereLogo className="w-7 h-7" />
            <span className="font-sans text-lg font-extrabold text-white tracking-tight group-hover:text-primary transition-colors">EventSphere</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-12 text-sm">
            <a className="text-primary border-b-2 border-primary font-semibold h-16 flex items-center transition-colors duration-150" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150 h-16 flex items-center" href="#stats">Telemetry</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-150 h-16 flex items-center" href="#cta">Solutions</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="text-on-surface-variant hover:text-white transition-colors text-sm font-semibold">Sign In</button>
          <button onClick={onGetStarted} className="bg-primary text-on-primary font-semibold text-sm px-4 py-2 rounded-xl active:scale-95 hover:bg-primary-container transition-all">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 px-12 hero-gradient overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-surface-container-highest px-4 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-mono text-[11px] font-semibold text-tertiary uppercase tracking-wider">AI Intelligent Core v3.5 Live</span>
            </div>
            
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              Revolutionize Your <br />
              <span className="text-primary bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Event Media</span> Flow
            </h1>
            
            <p className="text-base text-on-surface-variant max-w-lg leading-relaxed">
              Sophisticated AI-powered cloud management for large-scale event media. Secure, high-performance facial recognition and auto-tagging designed for clubs, organizers, and members.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onGetStarted} 
                className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
              >
                Access Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              
              <button className="glass-panel text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-secondary" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-panel p-4 rounded-3xl transform transition-transform duration-500 overflow-hidden relative">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img 
                  className="w-full h-full object-cover brightness-90" 
                  alt="High-tech tech conference main stage" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXpb0l4ipabG3s3oMolOv3FrtZ8hAr9z4_GCkyJtWPHXDaT3y-N_YxJL1e7TMJkRsWmCVZ0bNK-NBMSXgNt0VpJ2zSYNraSaXuiCoJL_hT76jc0nGHfOuH5SM7taVfzwmTHXV-dacOptRY5sqqxnk-dnHS8J7mn7eJV-nISFSHYw-SFTbmMRgiAMblse9KmQT3eDKUEPd_QD060SOnMCdu--mpkO0YsHwxfvjCdJYImGzdEQ8GlX-Tpc0GwdpRIyMfiLR6EHj--DFs"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">AI-Analyzed Event Gallery</div>
                        <div className="font-mono text-[11px] text-on-surface-variant">Real-Time Core Stream</div>
                      </div>
                    </div>
                    <div className="text-tertiary flex items-center gap-1 font-mono text-[10px] bg-tertiary/10 px-2 py-1 rounded-md border border-tertiary/20">
                      <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                      SECURED & INDEXED
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Ambient Blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-tertiary/10 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section id="features" className="py-24 px-12 bg-surface-container-lowest">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-primary font-mono text-label-caps uppercase tracking-widest text-[12px]">Engineered Architecture</span>
            <h2 className="text-3xl font-extrabold text-white">Unrivaled Vision Precision</h2>
            <p className="text-base text-on-surface-variant max-w-xl mx-auto">Built for maximum performance, bulletproof asset security, and infinite cloud scalability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Prop 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 relative group"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Smart Auto-Tagging</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Intelligent categorization of assets using multi-modal Gemini Vision. Identifies crowds, stages, people, nature, workshops, and ambient markers automatically upon secure upload.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-4">
                <span className="bg-white/5 text-on-surface-variant font-mono text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/5">#WORKSHOP</span>
                <span className="bg-white/5 text-on-surface-variant font-mono text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/5">#CROWD</span>
              </div>
            </motion.div>

            {/* Prop 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 relative group"
            >
              <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-2xl flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
                <Laugh className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Facial Scan Identification</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Attendees upload a basic reference profile selfie to instantly search and track all public or private event photos they appear in, with zero custom neural network overhead.
              </p>
              <div className="flex items-center gap-2 mt-auto pt-4">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/30 border border-slate-950" />
                  <div className="w-5 h-5 rounded-full bg-secondary/30 border border-slate-950" />
                  <div className="w-5 h-5 rounded-full bg-tertiary/30 border border-slate-950" />
                </div>
                <span className="text-tertiary font-mono text-[10px] tracking-wider uppercase">99.8% Core Accuracy</span>
              </div>
            </motion.div>

            {/* Prop 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 relative group"
            >
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AWS S3 Cloud Storage</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Direct integration with structured AWS S3 storage buckets. Files are systematically organized with temporary signed URLs to enforce high security standards.
              </p>
              <div className="w-full mt-auto pt-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-4/5 animate-pulse" />
                </div>
                <span className="text-on-surface-variant font-mono text-[9px] mt-1.5 block uppercase tracking-wider">Storage Durability Active</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Telemetry/Stats Panel */}
      <section id="stats" className="py-20 px-12 border-y border-white/5 bg-ink">
        <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-1 group">
            <div className="text-4xl font-extrabold text-white group-hover:text-primary transition-colors font-mono">10,000+</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Photos Managed</div>
          </div>
          <div className="text-center space-y-1 group">
            <div className="text-4xl font-extrabold text-white group-hover:text-tertiary transition-colors font-mono">500+</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Active Events</div>
          </div>
          <div className="text-center space-y-1 group">
            <div className="text-4xl font-extrabold text-white group-hover:text-secondary transition-colors font-mono">50ms</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Search Latency</div>
          </div>
          <div className="text-center space-y-1 group">
            <div className="text-4xl font-extrabold text-white group-hover:text-primary transition-colors font-mono">24/7</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">Active Monitoring</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 px-12 relative">
        <div className="container mx-auto glass-panel rounded-[2.5rem] p-16 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="lg:w-1/2 space-y-6 relative z-10">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">Ready to master your <br />event media flow?</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Join the world's most innovative event organizers. Upload, index, analyze, search and watermark using EventSphere secure asset protocols.
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={onGetStarted} 
                className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Start Free Trial
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-6 relative z-10 w-full">
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden aspect-square border border-white/5">
                <img 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105" 
                  alt="Camera lens visualizer" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbaxGAcCLCb5txIZVB3xu5jtq8cw4Q-N6xasxsOaeNbFqd4JL2JhM67AMtk3_T0hCbxKgi8vcs9yGiJVDlUiXu-s24Z6rzFgMUniRy_tTgzRj4XaskOg5tdzqFivrfSjg8DFDF-rGp9ss-Ycto5TJXGEpo7hWUB71A-KzPvJbnMnFGS0pLsiv8FHLjrFOp2n1uZ_VZpV6oMFYE6QONehOOkMFA1gS107MQqffVLHfrzewW0JGTI-D0j6C6AMj86DYRYHkP7kFtAnV-"
                />
              </div>
              <div className="glass-panel p-6 rounded-2xl space-y-1">
                <div className="font-bold text-white text-sm">Trust Architecture</div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-sans">Role-Based Access Control and strict secure signed downloads.</p>
              </div>
            </div>
            
            <div className="space-y-6 pt-12">
              <div className="glass-panel p-6 rounded-2xl space-y-1">
                <div className="font-bold text-white text-sm">Scale Optimization</div>
                <p className="text-xs text-on-surface-variant leading-relaxed font-sans">Rapid vector embeddings lookups matching profile targets in seconds.</p>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square border border-white/5">
                <img 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105" 
                  alt="Control room visualizer" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADyaTqf74K1bYtKvQoPFSSS-RCyZEKthLvVhcE782a8JuFfJgjdW2QjyCD-miB59Ij37ifu4D4zrqSC74XL82Rb-C0pNPIPwLwZZgYibZPQZO0E-gcXOOzhbfTAKwU1lQQYPxbJhcIHuZSFjSfNrQehopRtJU16lkOhjacmAyvAreFqQW8GYijecAtwehKOt_oWzwU7P5PwoE-wnibfjalOUe8feyJgaYIrmnmopBN3Q4Z3CgK3yV4j0gxHLHcsI3VZSvbDp_eNZMq"
                />
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#adc6ff 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-12 bg-surface-container-lowest border-t border-white/5 text-sm">
        <div className="container mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <EventSphereLogo className="w-8 h-8" />
              <span className="font-sans text-lg font-extrabold text-white tracking-tight">EventSphere</span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">The AI-Powered Command Center for elite event organizers, photographers and club members.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Core Technology</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Gemini Multi-Modal API</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Embedded Face Vectors</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Secure Image Overlay</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Telemetry Logs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">API Solutions</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Developer Docs</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Prisma Schemas</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Webhook Listeners</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">SLA Assurances</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white">Subscribe to Releases</h4>
            <div className="flex gap-2">
              <input className="bg-ink border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary grow" placeholder="Your Email Address" type="email" />
              <button className="bg-primary text-on-primary p-2 rounded-xl hover:bg-primary-container active:scale-95 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 text-on-surface-variant pt-2">
              <Share2 className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
              <Globe className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
              <FileCode className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant text-xs">
          <p className="font-mono">© 2026 EventSphere. Secure Media Protocol Fully Activated.</p>
          <div className="flex gap-6 font-mono">
            <a className="hover:text-white" href="#">Privacy SLA</a>
            <a className="hover:text-white" href="#">Terms of Use</a>
            <a className="hover:text-white" href="#">Hackathon Spec</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
