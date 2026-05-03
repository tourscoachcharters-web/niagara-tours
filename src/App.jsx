import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Clock, CheckCircle, Menu, X, ArrowRight, ChevronDown, 
  Users, Instagram, Facebook, Twitter, Mail, Phone, 
  Compass, Image as ImageIcon, Star 
} from 'lucide-react';

// --- FIXED FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDvLSW-T46JLmnVYRGQ9WFO0UMno8AULuU",
  authDomain: "niagara-tours.firebaseapp.com",
  projectId: "niagara-tours",
  storageBucket: "niagara-tours.firebasestorage.app",
  messagingSenderId: "1098010109074",
  appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
};

const appId = "niagara_tours_prod_v1";

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Components ---

const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`${className} bg-stone-100 flex flex-col items-center justify-center border-2 border-dashed border-stone-200 p-4 text-center`}>
        <ImageIcon className="text-stone-300 mb-2" size={32} />
        <span className="text-[0.6rem] font-bold tracking-widest text-stone-400 uppercase">Image Unavailable</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-3 shrink-0">
    <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg shrink-0">
      <Compass className={light ? "text-white" : "text-[#0F3D3E]"} size={22} />
    </div>
    <div className="flex flex-col text-left leading-none shrink-0">
      <span className={`text-lg font-black tracking-tighter uppercase ${light ? 'text-white' : 'text-[#0F3D3E]'}`}>NIAGARA</span>
      <span className="text-[0.55rem] font-bold tracking-[0.3em] text-[#F5A623] uppercase">Tours</span>
    </div>
  </div>
);

const Nav = ({ setView, activeView }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const links = [{ id: 'home', label: 'Home' }, { id: 'tours', label: 'Expeditions' }, { id: 'about', label: 'Our Story' }, { id: 'contact', label: 'Concierge' }];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1280px] mx-auto px-10 md:px-16 flex items-center justify-between w-full">
        <button onClick={() => { setView('home'); setIsOpen(false); }} className="hover:opacity-80 transition-opacity">
          <Logo light={!scrolled && activeView === 'home'} />
        </button>
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <button key={link.id} onClick={() => setView(link.id)} className={`text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all hover:text-[#F5A623] ${activeView === link.id ? 'text-[#F5A623]' : (scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white')}`}>{link.label}</button>
          ))}
          <button onClick={() => setView('booking')} className="bg-[#0F3D3E] text-white px-8 py-3 rounded-full text-[0.6rem] font-bold uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-lg">Book Now</button>
        </div>
        <button className={`md:hidden p-2 rounded-lg ${scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-12 flex flex-col gap-8 animate-fade-in border-t border-stone-100">
          {links.map(link => (
            <button key={link.id} onClick={() => { setView(link.id); setIsOpen(false); }} className={`text-left text-2xl font-black uppercase tracking-widest ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}>{link.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
};

const TourCard = ({ tour, onSelect, onDetail }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100">
    <div className="relative h-72 overflow-hidden">
      <SafeImage src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-6 left-6 bg-[#0F3D3E]/80 backdrop-blur-md px-4 py-2 rounded-lg text-white text-[0.6rem] font-black uppercase tracking-widest z-10">{tour.category}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    <div className="p-10 flex-grow flex flex-col justify-between text-left">
      <div>
        <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 line-clamp-1">{tour.name}</h3>
        <div className="flex items-center gap-5 mb-8 text-stone-400">
          <div className="flex items-center gap-2"><Clock size={16} className="text-[#F5A623]" /><span className="text-[0.65rem] font-bold uppercase tracking-widest">{tour.duration}</span></div>
          <div className="flex items-center gap-2"><Users size={16} className="text-[#F5A623]" /><span className="text-[0.65rem] font-bold uppercase tracking-widest">{tour.capacity} Seats</span></div>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => onDetail(tour)} className="flex-grow bg-stone-100 text-[#0F3D3E] py-4 rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-stone-200 transition-colors">Details</button>
        <button onClick={() => onSelect(tour)} className="flex-grow bg-[#0F3D3E] text-white py-4 rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-[#F5A623] transition-all shadow-lg">Book</button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    const unsubscribe = onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", description: "Flagship full-day journey.", image: "https://images.unsplash.com/photo-1549413240-3b9560376d54?auto=format&fit=crop&q=80&w=1200" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", description: "Witness the falls at twilight.", image: "https://images.unsplash.com/photo-1552600213-90d571871a2e?auto=format&fit=crop&q=80&w=1200" }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FDFDF9] font-sans text-stone-900 overflow-x-hidden flex flex-col">
      <Nav setView={setView} activeView={view} />
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
              <div className="relative z-10 w-full max-w-[1280px] mx-auto px-10 md:px-16 animate-slide-up text-left pt-20">
                <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20">
                  <Star size={16} className="text-[#F5A623]" fill="currentColor" />
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-white">Niagara's Premier Choice</span>
                </div>
                <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter uppercase leading-[0.8] text-white">Niagara <br/><span className="text-[#F5A623]">Redefined.</span></h1>
                <p className="text-white/90 text-xl md:text-2xl mt-12 max-w-2xl font-medium leading-relaxed">Luxury small-group departures from Toronto.</p>
                <button onClick={() => setView('tours')} className="mt-16 bg-[#F5A623] px-16 py-8 rounded-full font-black uppercase text-[0.8rem] tracking-[0.2em] shadow-2xl hover:bg-white transition-all">Explore Collections</button>
              </div>
            </section>
            <section className="py-40 px-10 md:px-16 w-full max-w-[1280px] mx-auto">
              <h2 className="text-5xl md:text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-24">Signature Journeys</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {tours.map(t => <TourCard key={t.id} tour={t} onSelect={() => setView('booking')} onDetail={() => {}} />)}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="bg-[#0F3D3E] text-white py-32 text-center border-t border-white/5">
        <Logo light />
        <p className="text-[0.7rem] font-black uppercase tracking-[0.6em] opacity-30 mt-10">© 2026 Niagara Tours Canada</p>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(80px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.6s ease-out forwards; }
      `}} />
    </div>
  );
}