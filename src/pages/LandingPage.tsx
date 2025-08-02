
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Users, CheckCircle, Star, ArrowRight, Sparkles, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Goal Setting",
      description: "Let AI help you set SMART goals tailored to your ambitions and lifestyle.",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Get AI-powered insights and progress analytics to optimize your goal achievement.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Intelligent Coaching",
      description: "Receive personalized AI coaching and recommendations to stay on track.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: Sparkles,
      title: "Automated Tracking",
      description: "Smart task breakdown and automated progress tracking powered by AI.",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "KAIGT has revolutionized how I approach my personal and professional goals. The AI insights are incredible!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Michael Chen",
      role: "Entrepreneur",
      content: "The AI coaching feature is like having a personal mentor 24/7. I've achieved more in 6 months than in years.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Emma Davis",
      role: "Team Lead",
      content: "The AI-powered team collaboration features have transformed our productivity. Outstanding platform!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Target className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">KAIGT</h1>
              <p className="text-xs text-muted-foreground">AI Goal Companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-indigo-50 dark:hover:bg-indigo-900">Login</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 dark:from-indigo-400/10 dark:to-purple-400/10"></div>
        <div className="container mx-auto text-center relative">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Powered by Advanced AI</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                KAIGT
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-200 text-4xl md:text-5xl">
                Your AI-Powered Goal Companion
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your ambitions into achievements with intelligent goal setting, smart tracking, 
              and personalized AI coaching. Experience the future of productivity today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/login">
                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                  Start Your AI Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900">
                  Login to Continue
                </Button>
              </Link>
            </div>
            
            {/* Hero Image */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
                alt="KAIGT AI-powered goal tracking dashboard"
                className="rounded-2xl shadow-2xl w-full h-auto relative z-10 border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl z-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">AI-Powered Features</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              Everything You Need to <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Succeed</span>
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our comprehensive AI platform provides intelligent tools and insights to help you set, track, and achieve your goals more effectively than ever before.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-5xl md:text-6xl font-bold mb-4 group-hover:scale-105 transition-transform">10,000+</div>
              <div className="text-xl text-slate-600 dark:text-slate-400 font-medium">Goals Achieved with AI</div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-5xl md:text-6xl font-bold mb-4 group-hover:scale-105 transition-transform">5,000+</div>
              <div className="text-xl text-slate-600 dark:text-slate-400 font-medium">Active AI Users</div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-5xl md:text-6xl font-bold mb-4 group-hover:scale-105 transition-transform">98%</div>
              <div className="text-xl text-slate-600 dark:text-slate-400 font-medium">AI Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200/50 dark:border-yellow-800/50 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">User Success Stories</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-200">
              What Our <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">AI Users</span> Say
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Join thousands of successful individuals and teams who trust KAIGT to achieve their goals with AI assistance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                <CardContent className="pt-8 pb-6">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Sparkles className="h-16 w-16 mx-auto mb-8 text-yellow-300" />
            <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Ready to Transform Your Goals with AI?
            </h3>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful individuals who have achieved their dreams with KAIGT's AI-powered goal tracking and coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login">
                <Button size="lg" className="text-lg px-10 py-6 bg-white text-indigo-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white hover:text-indigo-600">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative">
                <Target className="h-6 w-6 text-indigo-400" />
                <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">KAIGT</span>
                <p className="text-xs text-slate-400">AI Goal Companion</p>
              </div>
            </div>
            <div className="text-slate-400">
              © 2025 KAIGT - Your AI-Powered Goal Companion. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
