import React, { useState, useEffect, useMemo } from 'react';
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
  Compass, Image as ImageIcon, Star, MapPin, 
  ShieldCheck, Coffee, Camera, Waves
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "",
      authDomain: "niagara-tours.firebaseapp.com",
      projectId: "niagara-tours",
      storageBucket: "niagara-tours.firebasestorage.app",
      messagingSenderId: "1098010109074",
      appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
    };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'niagara-tours-v1';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Components ---

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

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'tours', label: 'Expeditions' },
    { id: 'about', label: 'Our Story' },
    { id: 'contact', label: 'Concierge' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled || activeView !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex items-center justify-between w-full">
        <button onClick={() => { setView('home'); setIsOpen(false); window.scrollTo(0,0); }} className="hover:opacity-80 transition-opacity">
          <Logo light={!scrolled && activeView === 'home'} />
        </button>
        
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => { setView(link.id); window.scrollTo(0,0); }} 
              className={`text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all hover:text-[#F5A623] ${activeView === link.id ? 'text-[#F5A623]' : (scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white')}`}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => { setView('booking'); window.scrollTo(0,0); }} className="bg-[#0F3D3E] text-white px-7 py-2.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-lg">Book Now</button>
        </div>

        <button className={`md:hidden p-2 rounded-lg ${scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-10 flex flex-col gap-8 animate-fade-in border-t border-stone-100">
          {links.map(link => (
            <button key={link.id} onClick={() => { setView(link.id); setIsOpen(false); window.scrollTo(0,0); }} className={`text-left text-xl font-black uppercase tracking-widest ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}>{link.label}</button>
          ))}
          <button onClick={() => { setView('booking'); setIsOpen(false); window.scrollTo(0,0); }} className="bg-[#0F3D3E] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Book Your Trip</button>
        </div>
      )}
    </nav>
  );
};

const TourCard = ({ tour, onSelect, onDetail }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100">
    <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => onDetail(tour)}>
      <SafeImage src={tour.image} alt={tour.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-6 left-6 bg-[#0F3D3E]/80 backdrop-blur-md px-4 py-2 rounded-lg text-white text-[0.6rem] font-black uppercase tracking-widest z-10">{tour.category}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-6 left-6 text-white">
        <p className="text-2xl font-black tracking-tighter uppercase leading-none">${tour.price}</p>
        <p className="text-[0.55rem] font-bold uppercase tracking-widest opacity-70">Per Explorer</p>
      </div>
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

const BookingForm = ({ tour, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', date: '', guests: 1 });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-20 rounded-[3.5rem] shadow-2xl border border-stone-100 animate-fade-in text-left">
      <h2 className="text-4xl md:text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 leading-none">
        {tour ? tour.name : "Reserve Your Expedition"}
      </h2>
      <p className="text-stone-400 font-bold uppercase tracking-widest text-[0.6rem] mb-12">Finalize your details below to secure your spot.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 ml-2">Full Name</label>
          <input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-all shadow-sm" placeholder="e.g. Alexander Knight" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 ml-2">Email Address</label>
          <input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-all shadow-sm" placeholder="e.g. alex@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 ml-2">Date</label>
            <input required type="date" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-all shadow-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 ml-2">Guests</label>
            <select className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-all shadow-sm appearance-none" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-4">
          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0F3D3E] text-white py-7 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-2xl disabled:opacity-50 text-base">
            {isSubmitting ? 'Securing Spot...' : 'Confirm Reservation'}
          </button>
          <button type="button" onClick={onCancel} className="w-full text-stone-400 font-black uppercase tracking-widest text-[0.7rem] mt-6 hover:text-red-500 transition-colors">Cancel Booking</button>
        </div>
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

  // Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Firestore Sync & Seed
  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    const unsubscribe = onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { 
            name: "The Grand Estate", 
            price: 129, 
            category: "Heritage", 
            capacity: 48, 
            duration: "9 Hours", 
            description: "A flagship full-day journey starting in Toronto. We explore the historic Niagara-on-the-Lake, enjoy a private vineyard tour, and end with VIP access to the Power Station Tunnel.", 
            image: "https://images.unsplash.com/photo-1549413240-3b9560376d54?auto=format&fit=crop&q=80&w=1200",
            highlights: ["Vineyard Tasting", "Heritage Walk", "Power Station Access", "Small Group Van"]
          },
          { 
            name: "Sunset Illumination", 
            price: 159, 
            category: "Culinary", 
            capacity: 24, 
            duration: "6 Hours", 
            description: "Experience the magic of the falls as they are painted with light. This evening tour includes a curated three-course dinner overlooking the Horseshoe Falls and fireworks (seasonal).", 
            image: "https://images.unsplash.com/photo-1552600213-90d571871a2e?auto=format&fit=crop&q=80&w=1200",
            highlights: ["Gourmet Dinner", "Light Show", "Late Night Return", "Expert Guide"]
          },
          { 
            name: "Maid of the Mist VIP", 
            price: 199, 
            category: "Adventure", 
            capacity: 12, 
            duration: "8 Hours", 
            description: "Get as close as possible. This exclusive tour grants early-boarding for the Maid of the Mist, followed by a helicopter flyover for a bird's eye view of the entire Niagara gorge.", 
            image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=1200",
            highlights: ["Helicopter Flight", "Boat Cruise", "Skip-the-line", "Ultra Small Group"]
          }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => console.error("Firestore sync error:", err));
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
        tourName: selectedTour?.name || 'Custom Inquiry',
        userId: user.uid, 
        createdAt: serverTimestamp() 
      });
      setView('success');
    } catch (err) {
      setErrorMsg("Booking failed. Please try again.");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] font-sans selection:bg-[#F5A623]/20 text-stone-900 overflow-x-hidden flex flex-col">
      <Nav setView={setView} activeView={view} />
      
      {errorMsg && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-8 py-5 rounded-2xl z-[200] animate-slide-up shadow-2xl font-bold flex items-center gap-3">
          <X size={20} /> {errorMsg}
        </div>
      )}
      
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
              <div className="relative z-10 w-full max-w-[1280px] mx-auto px-10 md:px-16 animate-slide-up flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20">
                  <Star size={16} className="text-[#F5A623]" fill="currentColor" />
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-white">Niagara's Premier Choice</span>
                </div>
                <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase leading-[0.8] text-white">Niagara <br/><span className="text-[#F5A623]">Redefined.</span></h1>
                <p className="text-white/90 text-xl md:text-2xl mt-10 max-w-2xl font-medium leading-relaxed">Luxury small-group departures from Toronto. Experience the power and majesty with world-class hospitality.</p>
                <div className="mt-14 flex flex-wrap gap-6">
                  <button onClick={() => setView('tours')} className="bg-[#F5A623] px-14 py-7 rounded-full font-black uppercase text-[0.75rem] tracking-[0.2em] shadow-2xl hover:bg-white hover:text-[#0F3D3E] transition-all transform hover:-translate-y-1">Explore Collections</button>
                  <button onClick={() => setView('about')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-14 py-7 rounded-full font-black uppercase text-[0.75rem] tracking-[0.2em] shadow-2xl hover:bg-white/20 transition-all transform hover:-translate-y-1">Our Story</button>
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
                <ChevronDown size={32} />
              </div>
            </section>

            <section className="py-32 px-6 md:px-16 w-full max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="text-left">
                  <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.4em] mb-4 block">Handpicked Expeditions</span>
                  <h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter">Signature Journeys</h2>
                </div>
                <button onClick={() => setView('tours')} className="text-[#0F3D3E] font-black uppercase tracking-[0.2em] text-[0.7rem] flex items-center gap-4 hover:text-[#F5A623] transition-colors group">
                  Full Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {tours.map(t => (
                  <TourCard 
                    key={t.id} 
                    tour={t} 
                    onSelect={(t) => {setSelectedTour(t); setView('booking');}} 
                    onDetail={(t) => {setSelectedTour(t); setView('detail');}} 
                  />
                ))}
              </div>
            </section>

            <section className="py-32 bg-[#0F3D3E] text-white">
              <div className="max-w-[1280px] mx-auto px-10 grid md:grid-cols-4 gap-12 text-center md:text-left">
                {[
                  { icon: ShieldCheck, title: "Safety First", desc: "Certified luxury fleet" },
                  { icon: Users, title: "Small Groups", desc: "Maximum 12 guests" },
                  { icon: Coffee, title: "VIP Dining", desc: "Curated local menu" },
                  { icon: MapPin, title: "Expert Guides", desc: "Local storytellers" }
                ].map((feature, i) => (
                  <div key={i} className="group cursor-default">
                    <feature.icon className="text-[#F5A623] mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform" size={40} />
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-2">{feature.title}</h4>
                    <p className="text-white/40 text-sm font-medium uppercase tracking-widest">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'tours' && (
          <section className="py-40 px-6 md:px-16 w-full max-w-[1280px] mx-auto text-left">
            <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.4em] mb-4 block">Our Full Catalog</span>
            <h1 className="text-7xl font-black text-[#0F3D3E] uppercase mb-20 tracking-tighter">The Collections</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-fade-in">
              {tours.map(t => (
                <TourCard 
                  key={t.id} 
                  tour={t} 
                  onSelect={(t) => {setSelectedTour(t); setView('booking');}} 
                  onDetail={(t) => {setSelectedTour(t); setView('detail');}} 
                />
              ))}
            </div>
          </section>
        )}

        {view === 'detail' && selectedTour && (
          <section className="py-40 px-6 md:px-16 w-full max-w-[1280px] mx-auto animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-12">
                <div className="text-left">
                  <button onClick={() => setView('tours')} className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                    <ArrowRight size={14} className="rotate-180" /> Back to Collections
                  </button>
                  <h1 className="text-6xl md:text-8xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-6">{selectedTour.name}</h1>
                  <div className="flex flex-wrap gap-4 mb-10">
                    <span className="bg-[#F5A623] text-[#0F3D3E] px-4 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest">{selectedTour.category}</span>
                    <span className="bg-stone-100 text-stone-500 px-4 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> {selectedTour.duration}</span>
                  </div>
                  <p className="text-2xl text-[#0F3D3E] font-medium leading-relaxed mb-12">{selectedTour.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  {selectedTour.highlights?.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 text-left group">
                      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-[#F5A623] shrink-0 group-hover:bg-[#F5A623] group-hover:text-white transition-all">
                        <CheckCircle size={20} />
                      </div>
                      <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#0F3D3E]">{h}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-10 flex gap-6">
                  <button onClick={() => setView('booking')} className="bg-[#0F3D3E] text-white px-12 py-7 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-2xl">Secure Your Space</button>
                  <div className="text-left">
                    <p className="text-stone-400 text-[0.55rem] font-bold uppercase tracking-widest mb-1">Starting from</p>
                    <p className="text-3xl font-black text-[#0F3D3E] tracking-tighter">${selectedTour.price} USD</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                  <SafeImage src={selectedTour.image} alt={selectedTour.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-12 rounded-[3rem] shadow-2xl border border-stone-50 hidden md:block">
                  <div className="flex gap-8">
                    <div className="text-center">
                      <Camera className="text-[#F5A623] mx-auto mb-2" />
                      <p className="text-[0.5rem] font-black uppercase tracking-widest text-stone-400">Photo Ops</p>
                    </div>
                    <div className="text-center">
                      <Waves className="text-[#F5A623] mx-auto mb-2" />
                      <p className="text-[0.5rem] font-black uppercase tracking-widest text-stone-400">Falls Access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'about' && (
          <section className="py-40 px-6 md:px-16 w-full max-w-[900px] mx-auto text-left animate-fade-in">
             <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.4em] mb-6 block">Our Legacy</span>
             <h1 className="text-6xl md:text-7xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter leading-none">Crafting Memories Since 1994.</h1>
             <p className="text-3xl text-[#0F3D3E] font-bold leading-tight mb-12 border-l-8 border-[#F5A623] pl-10">Founded in the heart of Toronto, Niagara Tours has redefined the standard of luxury excursions in Ontario.</p>
             <div className="space-y-8 text-xl text-stone-500 leading-relaxed font-medium">
                <p>Our journey began with a single vision: to transform a simple day trip into a sophisticated, story-driven expedition. We believe that seeing the falls is only the beginning.</p>
                <p>Today, we pride ourselves on small-group intimacy, strictly curated culinary partnerships, and a level of hospitality that makes every guest feel like a VIP. Our fleet is maintained to the highest standards of luxury and safety.</p>
             </div>
          </section>
        )}

        {view === 'contact' && (
          <section className="py-40 px-6 md:px-16 w-full max-w-[1280px] mx-auto text-left animate-fade-in">
             <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.4em] mb-6 block">Get in Touch</span>
             <h1 className="text-7xl md:text-8xl font-black text-[#0F3D3E] uppercase mb-20 tracking-tighter">Concierge.</h1>
             <div className="grid lg:grid-cols-2 gap-24">
                <div className="space-y-12">
                   <div className="flex items-center gap-8 group">
                      <div className="w-20 h-20 rounded-[2rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm">
                        <Phone size={32} />
                      </div> 
                      <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-1">Direct Line</p>
                        <p className="text-3xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">+1 416-555-0199</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8 group">
                      <div className="w-20 h-20 rounded-[2rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm">
                        <Mail size={32} />
                      </div> 
                      <div>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-1">Email Inquiry</p>
                        <p className="text-3xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">hello@niagaratours.ca</p>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-8 md:p-16 rounded-[4rem] shadow-2xl border border-stone-100">
                   <h3 className="text-2xl font-black text-[#0F3D3E] uppercase mb-10 tracking-tighter">Instant Message</h3>
                   <form className="space-y-6" onSubmit={e => {e.preventDefault(); setView('success');}}>
                      <input required className="w-full bg-stone-50 p-6 rounded-2xl outline-none focus:bg-white focus:border-[#F5A623] border border-transparent transition-all shadow-inner" placeholder="Your Name" />
                      <textarea required rows="4" className="w-full bg-stone-50 p-6 rounded-2xl outline-none focus:bg-white focus:border-[#F5A623] border border-transparent transition-all shadow-inner" placeholder="How can we assist you?"></textarea>
                      <button className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Send Dispatch</button>
                   </form>
                </div>
             </div>
          </section>
        )}

        {view === 'booking' && (
          <section className="py-40 px-6 bg-[#FDFDF9]">
            <BookingForm 
              tour={selectedTour} 
              onSubmit={handleBooking} 
              onCancel={() => setView('home')} 
              isSubmitting={isSubmitting} 
            />
          </section>
        )}

        {view === 'success' && (
          <section className="py-60 text-center animate-fade-in px-10">
            <div className="w-28 h-28 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl">
              <CheckCircle className="text-white" size={60} />
            </div>
            <h2 className="text-7xl md:text-[9rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-8">Confirmed.</h2>
            <p className="text-2xl text-stone-500 max-w-xl mx-auto font-medium leading-relaxed">Your expedition has been secured. Our concierge will be in touch shortly with your boarding credentials.</p>
            <button onClick={() => setView('home')} className="mt-16 bg-[#0F3D3E] text-white px-16 py-7 rounded-full font-black uppercase transition-all hover:bg-[#F5A623] shadow-2xl tracking-[0.2em] text-sm">Return Home</button>
          </section>
        )}
      </main>
      
      <footer className="bg-[#0F3D3E] text-white py-32 text-center mt-20 border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="flex flex-col items-center gap-4 mb-16">
            <Logo light />
            <p className="text-white/40 max-w-xs text-sm mt-4 leading-relaxed">Toronto's premier small-group luxury excursions to the Niagara region.</p>
          </div>
          <div className="flex justify-center gap-12 mb-20">
            <Instagram className="text-white/30 hover:text-[#F5A623] cursor-pointer transition-all transform hover:scale-125" size={24} />
            <Facebook className="text-white/30 hover:text-[#F5A623] cursor-pointer transition-all transform hover:scale-125" size={24} />
            <Twitter className="text-white/30 hover:text-[#F5A623] cursor-pointer transition-all transform hover:scale-125" size={24} />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-16 border-t border-white/10">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.5em] opacity-30">© 2026 Niagara Tours Canada</p>
            <div className="flex gap-10">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-white/30 hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-white/30 hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
      
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
        .animate-fade-in { animation: fade-in 1.4s ease-out forwards; }
      `}} />
    </div>
  );
}