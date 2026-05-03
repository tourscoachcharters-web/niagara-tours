import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Menu, X, Users, Star, Compass, 
  Image as ImageIcon, ChevronDown, MapPin, 
  ArrowRight, ShieldCheck, Waves, Instagram, 
  Facebook, Twitter 
} from 'lucide-react';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDvLSW-T46JLmnVYRGQ9WFO0UMno8AULuU",
  authDomain: "niagara-tours.firebaseapp.com",
  projectId: "niagara-tours",
  storageBucket: "niagara-tours.firebasestorage.app",
  messagingSenderId: "1098010109074",
  appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
};

const appId = "niagara_tours_prod_v1";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Components ---

const SafeImage = ({ src, alt, className, style }) => {
  const [error, setError] = useState(false);
  const cleanSrc = src ? src.split('?')[0] + "?auto=format&w=1200&q=75" : src;
  
  if (!src || error) {
    return (
      <div className={`${className} bg-stone-200 flex flex-col items-center justify-center p-4`} style={style}>
        <ImageIcon className="text-stone-400 mb-2" size={32} />
        <span className="text-[0.6rem] font-bold text-stone-500 uppercase">Image Unavailable</span>
      </div>
    );
  }
  return <img src={cleanSrc} alt={alt} className={className} style={style} onError={() => setError(true)} />;
};

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-3 select-none">
    <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0">
      <Compass color={light ? "white" : "#0F3D3E"} size={22} />
    </div>
    <div className="flex flex-col text-left leading-none">
      <span className={`text-xl font-black tracking-tighter ${light ? 'text-white' : 'text-[#0F3D3E]'}`}>NIAGARA</span>
      <span className="text-[0.55rem] font-bold tracking-[0.4em] text-[#F5A623] uppercase">Expeditions</span>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    return onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", description: "A full-day immersive journey through historic villages and the mighty falls.", image: "https://images.unsplash.com/photo-1549413240-3b9560376d54" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", description: "Experience the magic of the falls at twilight followed by an elite 3-course dinner.", image: "https://images.unsplash.com/photo-1552600213-90d571871a2e" },
          { name: "Aerial Majesty", price: 499, category: "Luxury", capacity: 4, duration: "2 Hours", description: "The ultimate perspective. A private helicopter tour over the entire Niagara region.", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29" }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
  }, [user]);

  const NavLink = ({ id, label }) => (
    <button 
      onClick={() => setView(id)}
      className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] transition-all relative group
        ${(view === 'home' && !scrolled) ? 'text-white/80 hover:text-white' : 'text-[#0F3D3E]/70 hover:text-[#0F3D3E]'}
      `}
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F5A623] transition-all group-hover:w-full"></span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col font-sans selection:bg-[#F5A623]/30">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 py-4 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <button onClick={() => setView('home')} className="hover:opacity-80 transition-opacity">
            <Logo light={view === 'home' && !scrolled} />
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink id="home" label="Overview" />
            <NavLink id="tours" label="Expeditions" />
            <NavLink id="about" label="Our Heritage" />
            <button 
              onClick={() => setView('tours')}
              className={`px-7 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95
                ${(view === 'home' && !scrolled) ? 'bg-white text-[#0F3D3E]' : 'bg-[#0F3D3E] text-white'}
              `}
            >
              Book Now
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`md:hidden p-2 rounded-xl transition-colors ${
              (view === 'home' && !scrolled) ? 'text-white hover:bg-white/10' : 'text-[#0F3D3E] hover:bg-[#0F3D3E]/5'
            }`}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-8 border-t border-stone-100 flex flex-col gap-6 animate-fade-in">
            {['home', 'tours', 'about'].map(id => (
              <button key={id} onClick={() => {setView(id); setIsOpen(false)}} className="text-left text-xl font-black text-[#0F3D3E] uppercase tracking-tighter">
                {id}
              </button>
            ))}
            <button onClick={() => {setView('tours'); setIsOpen(false)}} className="w-full bg-[#0F3D3E] text-white py-4 rounded-xl font-bold uppercase tracking-widest">
              Instant Booking
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      {view === 'home' && (
        <main className="flex-grow">
          <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
            <SafeImage 
              src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda" 
              className="absolute inset-0 w-full h-full object-cover" 
              style={{ filter: 'brightness(0.5)' }} 
            />
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-left animate-slide-up">
              <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                <Star size={14} color="#F5A623" fill="#F5A623" />
                <span className="text-white text-[0.55rem] font-bold uppercase tracking-[0.3em]">Canada's Leading Luxury Operator</span>
              </div>
              <h1 className="text-white font-black text-6xl md:text-[9rem] uppercase leading-[0.85] tracking-tighter mb-8">
                Feel the <br/><span className="text-[#F5A623]">Greatness.</span>
              </h1>
              <p className="text-white/80 max-w-xl text-lg md:text-xl font-medium leading-relaxed mb-12">
                Curated small-group departures from Toronto. Discover North America's iconic natural wonder through the lens of pure luxury and deep history.
              </p>
              <div className="flex flex-wrap gap-5">
                <button onClick={() => setView('tours')} className="bg-[#F5A623] text-[#0F3D3E] px-12 py-5 rounded-full font-black uppercase text-[0.7rem] tracking-[0.2em] shadow-2xl hover:bg-white transition-all hover:-translate-y-1">
                  Explore Expeditions
                </button>
                <button onClick={() => setView('about')} className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-12 py-5 rounded-full font-black uppercase text-[0.7rem] tracking-[0.2em] hover:bg-white/20 transition-all">
                  Our Legacy
                </button>
              </div>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce cursor-pointer">
              <ChevronDown size={32} />
            </div>
          </section>

          {/* Professional Stats/Trust Section */}
          <section className="py-20 bg-white border-y border-stone-100 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { icon: <ShieldCheck />, label: "Certified Luxury", val: "100%" },
                { icon: <Users />, label: "Small Groups", val: "12 Max" },
                { icon: <Waves />, label: "VIP Access", val: "Priority" },
                { icon: <Star />, label: "Average Rating", val: "4.9/5" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left group">
                  <div className="text-[#F5A623] mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
                  <div className="text-2xl font-black text-[#0F3D3E] tracking-tighter">{s.val}</div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Tours Grid */}
          <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="text-left">
                <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Hand-Selected Itineraries</span>
                <h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">The Signature Series</h2>
              </div>
              <button className="flex items-center gap-2 text-[#0F3D3E] font-bold uppercase text-[0.65rem] tracking-widest group">
                View All Expeditions <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {tours.map(t => (
                <div key={t.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100/50">
                  <div className="h-80 relative overflow-hidden">
                    <SafeImage src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest text-[#0F3D3E]">{t.category}</div>
                    <div className="absolute bottom-6 left-6 text-white z-10">
                      <div className="text-2xl font-black tracking-tighter mb-1">${t.price} <span className="text-sm font-normal opacity-70">/ PP</span></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-10 flex-grow flex flex-col justify-between text-left">
                    <div>
                      <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4">{t.name}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-3">
                        {t.description || "Experience the grandeur of the Niagara falls with a level of hospitality that is strictly unmatched."}
                      </p>
                      <div className="flex flex-wrap gap-6 mb-10 text-stone-400">
                         <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Clock size={14} className="text-[#F5A623]" /> {t.duration}</div>
                         <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Users size={14} className="text-[#F5A623]" /> {t.capacity} Seats</div>
                      </div>
                    </div>
                    <button onClick={() => setView('tours')} className="w-full bg-[#0F3D3E] text-white py-4 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-[#F5A623] transition-all">
                      Secure My Spot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#0F3D3E] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 text-left mb-20 border-b border-white/10 pb-20">
            <div className="col-span-1 md:col-span-1">
              <Logo light />
              <p className="mt-8 text-white/50 text-sm leading-relaxed max-w-xs">
                Since 1994, we have provided discerning travelers with bespoke access to Canada's most powerful natural wonders.
              </p>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-8">Expeditions</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li className="hover:text-white cursor-pointer transition-colors">The Signature Day</li>
                <li className="hover:text-white cursor-pointer transition-colors">Private Charters</li>
                <li className="hover:text-white cursor-pointer transition-colors">Aerial Journeys</li>
                <li className="hover:text-white cursor-pointer transition-colors">Seasonal Specials</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-8">Connect</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><MapPin size={16} /> Toronto, ON</li>
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Instagram size={16} /> @NiagaraExpeditions</li>
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Facebook size={16} /> Niagara Expeditions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-8">Newsletter</h4>
              <p className="text-white/50 text-xs mb-6">Receive travel insights and exclusive seasonal offers.</p>
              <div className="flex flex-col gap-3">
                <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F5A623]" placeholder="Email address" />
                <button className="bg-[#F5A623] text-[#0F3D3E] py-3 rounded-xl font-black uppercase text-[0.6rem] tracking-widest">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.5em] text-white/30">© 2026 Niagara Expeditions Canada</p>
            <div className="flex gap-8 text-[0.55rem] font-bold uppercase tracking-widest text-white/20">
              <span className="hover:text-white/60 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white/60 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { 
          from { opacity: 0; transform: translateY(60px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-slide-up { animation: slide-up 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fade-in { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        
        body { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}