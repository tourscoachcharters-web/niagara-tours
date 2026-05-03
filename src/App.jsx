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

// --- Hardcoded Configuration for Vercel Deployment ---
const firebaseConfig = {
  apiKey: "AIzaSyDvLSW-T46JLmnVYRGQ9WFO0UMno8AULuU",
  authDomain: "niagara-tours.firebaseapp.com",
  projectId: "niagara-tours",
  storageBucket: "niagara-tours.firebasestorage.app",
  messagingSenderId: "1098010109074",
  appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
};

const appId = "niagara_tours_prod_v1";

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
    <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg">
      <Compass className={light ? "text-white" : "text-[#0F3D3E]"} size={24} />
    </div>
    <div className="flex flex-col text-left">
      <span className={`text-xl font-black tracking-tighter leading-none uppercase ${light ? 'text-white' : 'text-[#0F3D3E]'}`}>NIAGARA</span>
      <span className="text-[0.6rem] font-bold tracking-[0.4em] text-[#F5A623] uppercase">Tours</span>
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button onClick={() => { setView('home'); setIsOpen(false); }} className="hover:opacity-80 transition-opacity">
          <Logo light={!scrolled && activeView === 'home'} />
        </button>
        <div className="hidden md:flex items-center gap-10">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => setView(link.id)} 
              className={`text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all hover:text-[#F5A623] ${activeView === link.id ? 'text-[#F5A623]' : (scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white')}`}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => setView('booking')} className="bg-[#0F3D3E] text-white px-8 py-3 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#F5A623] transition-all">Book Now</button>
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
        if (token) await signInWithCustomToken(auth, token);
        else await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
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
    }, (err) => setErrorMsg("Database sync failed. Check Firestore rules."));
    return () => unsubscribe();
  }, [user]);

  const handleBooking = async (data) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, { ...data, tourId: selectedTour?.id || 'general', userId: user.uid, createdAt: serverTimestamp() });
      setView('success');
    } catch (err) {
      setErrorMsg("Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] font-sans selection:bg-[#F5A623]/20 text-stone-900">
      <Nav setView={setView} activeView={view} />
      {errorMsg && <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-xl z-[100]">{errorMsg}</div>}
      <main className="pt-0">
        {view === 'home' && (
          <>
            <section className="relative h-[90vh] flex items-center px-6 overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
              <div className="relative z-10 max-w-7xl mx-auto w-full text-white animate-slide-up text-left">
                <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">Niagara <br/><span className="text-[#F5A623]">Redefined.</span></h1>
                <button onClick={() => setView('tours')} className="mt-10 bg-[#F5A623] px-12 py-6 rounded-full font-black uppercase shadow-2xl hover:bg-white hover:text-[#0F3D3E] transition-all">Explore Collections</button>
              </div>
            </section>
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <h2 className="text-4xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter text-left">Signature Journeys</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tours.map(t => <TourCard key={t.id} tour={t} onSelect={(t) => {setSelectedTour(t); setView('booking');}} onDetail={(t) => {setSelectedTour(t); setView('detail');}} />)}
              </div>
            </section>
          </>
        )}
        {view === 'tours' && (
          <section className="py-32 px-6 max-w-7xl mx-auto text-left">
            <h1 className="text-6xl font-black text-[#0F3D3E] uppercase mb-16 tracking-tighter">Collections</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">{tours.map(t => <TourCard key={t.id} tour={t} onSelect={(t) => {setSelectedTour(t); setView('booking');}} onDetail={(t) => {setSelectedTour(t); setView('detail');}} />)}</div>
          </section>
        )}
        {view === 'booking' && <section className="py-32 px-6"><BookingForm tour={selectedTour} onSubmit={handleBooking} onCancel={() => setView('home')} isSubmitting={isSubmitting} /></section>}
        {view === 'success' && <section className="py-48 text-center animate-fade-in"><CheckCircle className="text-[#F5A623] mx-auto mb-8" size={80} /><h2 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter">Confirmed.</h2><button onClick={() => setView('home')} className="mt-12 bg-[#0F3D3E] text-white px-12 py-6 rounded-full font-black uppercase">Return Home</button></section>}
      </main>
      <footer className="bg-[#0F3D3E] text-white py-24 text-center mt-20"><Logo light /><p className="text-[0.55rem] font-black uppercase tracking-[0.4em] opacity-30 mt-12">© 2026 Niagara Tours Canada</p></footer>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}} />
    </div>
  );
}