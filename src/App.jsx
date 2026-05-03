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
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Clock, CheckCircle, Menu, X, ArrowRight, ChevronDown, 
  Users, Instagram, Facebook, Twitter, Mail, Phone, 
  Compass, Image as ImageIcon, Star, ShieldCheck
} from 'lucide-react';

// --- Dynamic Configuration Logic ---
// We check for environment-provided config first to avoid token-mismatch errors in preview,
// then fall back to hardcoded keys for Vercel production.
const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    try {
      return JSON.parse(window.__firebase_config);
    } catch (e) {
      console.error("Firebase config parse error", e);
    }
  }
  return {
    apiKey: "AIzaSyDvLSW-T46JLmnVYRGQ9WFO0UMno8AULuU",
    authDomain: "niagara-tours.firebaseapp.com",
    projectId: "niagara-tours",
    storageBucket: "niagara-tours.firebasestorage.app",
    messagingSenderId: "1098010109074",
    appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
  };
};

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  return "niagara_tours_prod_v1";
};

const firebaseConfig = getFirebaseConfig();
const appId = getAppId();

// Initialize Services
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
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg shrink-0">
      <Compass className={light ? "text-white" : "text-[#0F3D3E]"} size={22} />
    </div>
    <div className="flex flex-col text-left leading-none">
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

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'tours', label: 'Expeditions' },
    { id: 'about', label: 'Our Story' },
    { id: 'contact', label: 'Concierge' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        <button onClick={() => { setView('home'); setIsOpen(false); }} className="hover:opacity-80 transition-opacity">
          <Logo light={!scrolled && activeView === 'home'} />
        </button>
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => setView(link.id)} 
              className={`text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all hover:text-[#F5A623] ${activeView === link.id ? 'text-[#F5A623]' : (scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white')}`}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => setView('booking')} className="bg-[#0F3D3E] text-white px-7 py-2.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest hover:bg-[#F5A623] transition-all">Book Now</button>
        </div>
        <button className={`md:hidden p-2 rounded-lg ${scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-8 flex flex-col gap-6 animate-fade-in border-t border-stone-100">
          {links.map(link => (
            <button key={link.id} onClick={() => { setView(link.id); setIsOpen(false); }} className={`text-left text-lg font-black uppercase tracking-widest ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}>{link.label}</button>
          ))}
          <button onClick={() => { setView('booking'); setIsOpen(false); }} className="bg-[#0F3D3E] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm">Book Now</button>
        </div>
      )}
    </nav>
  );
};

const TourCard = ({ tour, onSelect, onDetail }) => (
  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100">
    <div className="relative h-72 overflow-hidden">
      <SafeImage src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-6 left-6 bg-[#0F3D3E]/80 backdrop-blur-md px-4 py-2 rounded-lg text-white text-[0.6rem] font-black uppercase tracking-widest">{tour.category}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    <div className="p-8 flex-grow flex flex-col justify-between text-left">
      <div>
        <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 line-clamp-1">{tour.name}</h3>
        <div className="flex items-center gap-4 mb-6 text-stone-400">
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-[#F5A623]" /><span className="text-[0.6rem] font-bold uppercase tracking-widest">{tour.duration}</span></div>
          <div className="flex items-center gap-1.5"><Users size={14} className="text-[#F5A623]" /><span className="text-[0.6rem] font-bold uppercase tracking-widest">{tour.capacity} Seats</span></div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onDetail(tour)} className="flex-grow bg-stone-100 text-[#0F3D3E] py-4 rounded-xl font-black uppercase text-[0.6rem] tracking-widest hover:bg-stone-200 transition-colors">Details</button>
        <button onClick={() => onSelect(tour)} className="flex-grow bg-[#0F3D3E] text-white py-4 rounded-xl font-black uppercase text-[0.6rem] tracking-widest hover:bg-[#F5A623] transition-all">Book</button>
      </div>
    </div>
  </div>
);

const BookingForm = ({ tour, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', date: '', guests: 1 });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-stone-100 animate-fade-in text-left">
      <h2 className="text-4xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-8">{tour ? tour.name : "Reserve Expedition"}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input required className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="email" className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <div className="grid grid-cols-2 gap-6">
          <input required type="date" className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <select className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-xl disabled:opacity-50">
          {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
        </button>
        <button type="button" onClick={onCancel} className="w-full text-stone-400 font-black uppercase tracking-widest text-[0.6rem] hover:text-red-500 transition-colors">Cancel</button>
      </form>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? window.__initial_auth_token : null;
        if (token) {
          // If we have a token, we MUST use signInWithCustomToken
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        // Fallback for mismatch or token errors
        try { await signInAnonymously(auth); } catch(e) {}
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    const unsubscribe = onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", description: "Flagship full-day journey through the historic villages and the mighty falls.", image: "https://images.unsplash.com/photo-1549413240-3b9560376d54?auto=format&fit=crop&q=80&w=1200" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", description: "Witness the falls at twilight followed by a curated three-course dinner.", image: "https://images.unsplash.com/photo-1552600213-90d571871a2e?auto=format&fit=crop&q=80&w=1200" }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => {
      console.error("Firestore sync error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const handleBooking = async (data) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, { 
        ...data, 
        tourId: selectedTour?.id || 'general', 
        tourName: selectedTour?.name || 'Custom',
        userId: user.uid, 
        createdAt: serverTimestamp() 
      });
      setView('success');
    } catch (err) {
      setErrorMsg("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] font-sans selection:bg-[#F5A623]/20 text-stone-900 overflow-x-hidden">
      <Nav setView={setView} activeView={view} />
      {errorMsg && <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-xl z-[100] animate-fade-in">{errorMsg}</div>}
      <main>
        {view === 'home' && (
          <>
            <section className="relative h-[92vh] flex items-center overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" />
              <div className="relative z-10 max-w-7xl mx-auto w-full px-8 md:px-12 animate-slide-up text-left">
                <div className="inline-flex items-center gap-2 mb-6 bg-[#F5A623]/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#F5A623]/20">
                  <Star size={12} className="text-[#F5A623]" fill="currentColor" />
                  <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#F5A623]">Niagara's Premier Choice</span>
                </div>
                <h1 className="text-6xl md:text-[8.5rem] font-black tracking-tighter uppercase leading-[0.82] text-white">Niagara <br/><span className="text-[#F5A623]">Redefined.</span></h1>
                <p className="text-white/80 text-lg md:text-xl mt-8 max-w-xl font-medium leading-relaxed">Luxury small-group departures from Toronto. Experience the power and majesty with world-class hospitality.</p>
                <div className="flex flex-wrap gap-4 mt-12">
                  <button onClick={() => setView('tours')} className="bg-[#F5A623] px-10 py-5 rounded-full font-black uppercase text-[0.65rem] tracking-widest shadow-2xl hover:bg-white hover:text-[#0F3D3E] transition-all transform hover:-translate-y-1">Explore Collections</button>
                </div>
              </div>
            </section>
            <section className="py-24 px-8 md:px-12 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-[#0F3D3E] uppercase tracking-tighter">Signature Journeys</h2>
                <div className="h-px bg-stone-200 flex-grow mx-8 hidden md:block" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {tours.map(t => <TourCard key={t.id} tour={t} onSelect={(t) => {setSelectedTour(t); setView('booking');}} onDetail={(t) => {setSelectedTour(t); setView('detail');}} />)}
              </div>
            </section>
          </>
        )}
        {view === 'tours' && (
          <section className="py-32 px-8 md:px-12 max-w-7xl mx-auto text-left">
            <h1 className="text-6xl font-black text-[#0F3D3E] uppercase mb-16 tracking-tighter">Our Collections</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in">{tours.map(t => <TourCard key={t.id} tour={t} onSelect={(t) => {setSelectedTour(t); setView('booking');}} onDetail={(t) => {setSelectedTour(t); setView('detail');}} />)}</div>
          </section>
        )}
        {view === 'about' && (
          <section className="py-32 px-8 md:px-12 max-w-4xl mx-auto text-left animate-fade-in">
             <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-4 block">Our Legacy</span>
             <h1 className="text-6xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter">Crafting Memories Since 1994.</h1>
             <p className="text-2xl text-[#0F3D3E] font-bold leading-tight mb-8">Founded in the heart of Toronto, Niagara Tours has redefined the standard of luxury excursions in Ontario.</p>
             <p className="text-xl text-stone-500 leading-relaxed">Our journey began with a single vision: to transform a simple day trip into a sophisticated, story-driven expedition. Today, we pride ourselves on small-group intimacy and strictly curated experiences.</p>
          </section>
        )}
        {view === 'contact' && (
          <section className="py-32 px-8 md:px-12 max-w-7xl mx-auto text-left animate-fade-in">
             <h1 className="text-7xl font-black text-[#0F3D3E] uppercase mb-16 tracking-tighter">Concierge.</h1>
             <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-10">
                   <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-[#F5A623]"><Phone size={24} /></div> <p className="text-2xl font-black text-[#0F3D3E] tracking-tight">+1 416-555-0199</p></div>
                   <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-[#F5A623]"><Mail size={24} /></div> <p className="text-2xl font-black text-[#0F3D3E] tracking-tight">hello@niagaratours.ca</p></div>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
                   <h3 className="text-xl font-black text-[#0F3D3E] uppercase mb-8 tracking-tighter">Direct Inquiry</h3>
                   <form className="space-y-5" onSubmit={e => e.preventDefault()}>
                      <input className="w-full bg-stone-50 p-5 rounded-2xl outline-none focus:border-[#F5A623] border border-transparent transition-all" placeholder="Your Name" />
                      <textarea rows="4" className="w-full bg-stone-50 p-5 rounded-2xl outline-none focus:border-[#F5A623] border border-transparent transition-all" placeholder="Your Message"></textarea>
                      <button className="w-full bg-[#0F3D3E] text-white py-5 rounded-2xl font-black uppercase tracking-widest">Dispatch Inquiry</button>
                   </form>
                </div>
             </div>
          </section>
        )}
        {view === 'booking' && <section className="py-32 px-8 md:px-12"><BookingForm tour={selectedTour} onSubmit={handleBooking} onCancel={() => setView('home')} isSubmitting={isSubmitting} /></section>}
        {view === 'success' && <section className="py-48 text-center animate-fade-in px-8"><CheckCircle className="text-[#F5A623] mx-auto mb-8" size={80} /><h2 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter">Confirmed.</h2><button onClick={() => setView('home')} className="mt-12 bg-[#0F3D3E] text-white px-12 py-6 rounded-full font-black uppercase transition-all hover:bg-[#F5A623]">Return Home</button></section>}
      </main>
      <footer className="bg-[#0F3D3E] text-white py-24 text-center mt-20">
        <div className="flex flex-col items-center gap-2 mb-12">
          <Logo light />
        </div>
        <div className="flex justify-center gap-8 mb-16">
          <Instagram className="text-white/40 hover:text-[#F5A623] cursor-pointer transition-colors" size={20} />
          <Facebook className="text-white/40 hover:text-[#F5A623] cursor-pointer transition-colors" size={20} />
          <Twitter className="text-white/40 hover:text-[#F5A623] cursor-pointer transition-colors" size={20} />
        </div>
        <p className="text-[0.5rem] font-black uppercase tracking-[0.4em] opacity-30 px-6">© 2026 Niagara Tours Canada • All Rights Reserved</p>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
      `}} />
    </div>
  );
}