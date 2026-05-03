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
  MapPin, Clock, CheckCircle, Menu, X, ArrowRight, ChevronDown, 
  Users, Wind, Instagram, Facebook, Twitter, Mail, Phone, 
  Compass, Image as ImageIcon, Bus, Star, ShieldCheck
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "" }; // Fallback for local dev, will be overridden at runtime

const appId = typeof __app_id !== 'undefined' ? __app_id : 'niagara-tours-v1';

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
          <button 
            onClick={() => setView('booking')} 
            className="bg-[#0F3D3E] text-white px-8 py-3 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#F5A623] transition-all"
          >
            Book Now
          </button>
        </div>
        <button 
          className={`md:hidden p-2 rounded-lg ${scrolled || activeView !== 'home' ? 'text-[#0F3D3E]' : 'text-white'}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-8 flex flex-col gap-6 animate-fade-in border-t border-stone-100">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => { setView(link.id); setIsOpen(false); }} 
              className={`text-left text-lg font-black uppercase tracking-widest ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => { setView('booking'); setIsOpen(false); }} 
            className="bg-[#0F3D3E] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm"
          >
            Book Now
          </button>
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
      <div className="absolute bottom-6 left-6 text-white z-10 text-left">
        <p className="text-3xl font-black tracking-tighter">${tour.price}</p>
        <p className="text-[0.5rem] font-bold uppercase tracking-widest opacity-80">Per Person</p>
      </div>
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
      <h2 className="text-4xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-8">
        {tour ? tour.name : "Reserve Expedition"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-2 block ml-2">Full Name</label>
          <input required className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-colors" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-2 block ml-2">Email Address</label>
          <input required type="email" className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-colors" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-2 block ml-2">Departure Date</label>
            <input required type="date" className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-colors" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400 mb-2 block ml-2">Guest Count</label>
            <select className="w-full bg-[#FDFDF9] p-5 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623] transition-colors appearance-none" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
        </button>
        <button type="button" onClick={onCancel} className="w-full text-stone-400 font-black uppercase tracking-widest text-[0.6rem] hover:text-red-500 transition-colors">Cancel & Return</button>
      </form>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // RULE 3: Strict Auth Flow Initialization
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
        setErrorMsg("Authentication failed. Please refresh.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // RULE 3: Guarded Data Fetching
  useEffect(() => {
    if (!user) return;
    
    // Path: /artifacts/{appId}/public/data/tours
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    
    const unsubscribe = onSnapshot(toursCollection, (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial data if empty
        const initialTours = [
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", description: "Flagship full-day journey through historic Niagara-on-the-Lake and the mighty Horseshoe Falls.", image: "https://images.unsplash.com/photo-1549413240-3b9560376d54?auto=format&fit=crop&q=80&w=1200" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", description: "Witness the falls transform at twilight with colored illumination followed by a curated three-course dinner.", image: "https://images.unsplash.com/photo-1552600213-90d571871a2e?auto=format&fit=crop&q=80&w=1200" },
          { name: "Aerial Majesty", price: 499, category: "Luxury", capacity: 6, duration: "3 Hours", description: "A premium helicopter flight providing unparalleled panoramic views of the entire Niagara region.", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200" }
        ];
        initialTours.forEach(tour => {
          const docId = tour.name.toLowerCase().replace(/\s+/g, '-');
          setDoc(doc(toursCollection, docId), tour).catch(console.error);
        });
      } else {
        setTours(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (err) => {
      console.error("Firestore sync error:", err);
      setErrorMsg("Failed to sync tour data.");
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleBookingSubmit = async (formData) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Path: /artifacts/{appId}/public/data/bookings
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, { 
        ...formData, 
        tourId: selectedTour?.id || 'general', 
        tourName: selectedTour ? selectedTour.name : 'Custom Inquiry',
        userId: user.uid, 
        createdAt: serverTimestamp() 
      });
      setView('success');
    } catch (err) {
      console.error("Booking submission error:", err);
      setErrorMsg("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] font-sans selection:bg-[#F5A623]/20 text-stone-900 overflow-x-hidden">
      <Nav setView={setView} activeView={view} />
      
      {errorMsg && (
        <div className="fixed bottom-10 right-10 z-[100] bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-3">
          <ShieldCheck size={20} />
          <span className="text-xs font-black uppercase tracking-widest">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <main className="pt-0">
        {view === 'home' && (
          <>
            <section className="relative h-[95vh] flex items-center px-6 overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
              <div className="relative z-10 max-w-7xl mx-auto w-full text-white animate-slide-up text-left">
                <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Star className="text-[#F5A623]" size={14} fill="#F5A623" />
                  <span className="text-[0.6rem] font-black uppercase tracking-[0.3em]">Top Rated 2026</span>
                </div>
                <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">Experience <br/><span className="text-[#F5A623]">The Power.</span></h1>
                <p className="text-xl mt-8 max-w-xl opacity-90 font-medium leading-relaxed">Luxury small-group departures from Toronto. Immersive storytelling meets world-class hospitality at North America's greatest wonder.</p>
                <div className="flex flex-wrap gap-4 mt-10">
                  <button onClick={() => setView('tours')} className="bg-[#F5A623] px-12 py-6 rounded-full font-black uppercase text-sm shadow-2xl hover:bg-white hover:text-[#0F3D3E] transition-all transform hover:-translate-y-1">Explore Collections</button>
                  <button onClick={() => setView('about')} className="bg-white/10 backdrop-blur-md border border-white/30 px-12 py-6 rounded-full font-black uppercase text-sm hover:bg-white/20 transition-all">Our Legacy</button>
                </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-[0.5rem] font-black uppercase tracking-[0.5em]">Scroll</span>
                <ChevronDown size={20} />
              </div>
            </section>

            <section className="py-32 px-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div className="text-left">
                  <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-4 block">Curated Voyages</span>
                  <h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter">Signature Journeys</h2>
                </div>
                <button onClick={() => setView('tours')} className="text-[#0F3D3E] font-black uppercase tracking-widest text-[0.7rem] flex items-center gap-3 group">
                  View All Collections <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tours.map((tour, idx) => (
                  <TourCard 
                    key={tour.id || idx} 
                    tour={tour} 
                    onSelect={(t) => { setSelectedTour(t); setView('booking'); }} 
                    onDetail={(t) => { setSelectedTour(t); setView('detail'); }} 
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'tours' && (
          <section className="py-32 px-6 max-w-7xl mx-auto min-h-screen text-left">
            <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-4 block">Full Catalog</span>
            <h1 className="text-6xl font-black text-[#0F3D3E] uppercase mb-16 tracking-tighter">Our Complete Collections</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in">
              {tours.map((tour, idx) => (
                <TourCard 
                  key={tour.id || idx} 
                  tour={tour} 
                  onSelect={(t) => { setSelectedTour(t); setView('booking'); }} 
                  onDetail={(t) => { setSelectedTour(t); setView('detail'); }} 
                />
              ))}
            </div>
          </section>
        )}

        {view === 'detail' && selectedTour && (
          <section className="py-32 px-6 max-w-7xl mx-auto animate-fade-in text-left">
            <button onClick={() => setView('tours')} className="text-[#F5A623] font-black uppercase mb-10 block tracking-widest text-[0.7rem] hover:text-[#0F3D3E] transition-colors">← Back to Collection</button>
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div className="relative">
                <SafeImage src={selectedTour.image} className="rounded-[3rem] h-[650px] w-full object-cover shadow-2xl border border-stone-100" />
                <div className="absolute -bottom-10 -right-10 bg-[#F5A623] p-10 rounded-[2.5rem] shadow-2xl hidden md:block">
                   <p className="text-white text-[0.6rem] font-black uppercase tracking-widest mb-1 opacity-80">Starting at</p>
                   <p className="text-white text-5xl font-black tracking-tighter">${selectedTour.price}</p>
                </div>
              </div>
              <div className="space-y-10 pt-4">
                <div className="inline-block bg-[#0F3D3E] text-white px-4 py-2 rounded-lg text-[0.6rem] font-black uppercase tracking-widest">{selectedTour.category}</div>
                <h1 className="text-6xl md:text-7xl font-black text-[#0F3D3E] uppercase leading-[0.9] tracking-tighter">{selectedTour.name}</h1>
                <p className="text-2xl text-stone-500 mb-10 leading-relaxed font-medium border-l-4 border-[#F5A623] pl-8 italic">{selectedTour.description}</p>
                <div className="grid grid-cols-2 gap-10 py-10 border-y border-stone-100">
                    <div><p className="text-[0.6rem] font-black uppercase text-stone-400 tracking-widest mb-2">Duration</p><p className="text-2xl font-black text-[#0F3D3E] uppercase">{selectedTour.duration}</p></div>
                    <div><p className="text-[0.6rem] font-black uppercase text-stone-400 tracking-widest mb-2">Capacity</p><p className="text-2xl font-black text-[#0F3D3E] uppercase">{selectedTour.capacity} Passengers</p></div>
                </div>
                <div className="pt-6">
                  <button onClick={() => setView('booking')} className="w-full bg-[#0F3D3E] text-white px-12 py-8 rounded-[2rem] font-black uppercase text-lg shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Secure Reservation</button>
                  <p className="text-center text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 mt-6">Flexible cancellation up to 48 hours before departure</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'about' && (
          <section className="py-32 px-6 max-w-5xl mx-auto animate-fade-in text-left">
             <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-4 block">Since 1994</span>
             <h1 className="text-7xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter">Our Legacy.</h1>
             <p className="text-3xl text-[#0F3D3E] font-bold leading-tight mb-12">Founded in the heart of Toronto, Niagara Tours has redefined the standard of luxury excursions in Ontario.</p>
             <div className="space-y-8 text-xl text-stone-500 leading-relaxed max-w-3xl">
               <p>Our journey began with a single vintage motorcoach and a passion for sharing the untold stories of the Niagara escarpment. Today, we operate a bespoke fleet of executive vehicles, hosting thousands of guests from across the globe.</p>
               <p>We believe that luxury isn't just about the vehicle—it's about the timing, the secret viewpoints, and the expertly curated culinary stops that turn a day trip into a lifelong memory.</p>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-20 border-t border-stone-100">
                <div><p className="text-4xl font-black text-[#F5A623]">30+</p><p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400">Years Active</p></div>
                <div><p className="text-4xl font-black text-[#F5A623]">15k</p><p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400">Happy Guests</p></div>
                <div><p className="text-4xl font-black text-[#F5A623]">4.9</p><p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400">Avg Rating</p></div>
                <div><p className="text-4xl font-black text-[#F5A623]">12</p><p className="text-[0.6rem] font-black uppercase tracking-widest text-stone-400">Expert Guides</p></div>
             </div>
          </section>
        )}

        {view === 'contact' && (
          <section className="py-32 px-6 max-w-7xl mx-auto animate-fade-in text-left">
             <h1 className="text-7xl font-black text-[#0F3D3E] uppercase mb-16 tracking-tighter">Concierge.</h1>
             <div className="grid md:grid-cols-2 gap-24">
               <div className="space-y-12">
                 <div>
                    <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-6 block">Direct Line</span>
                    <div className="flex items-center gap-8 group cursor-pointer"><div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-[#0F3D3E] group-hover:bg-[#F5A623] group-hover:text-white transition-all"><Phone size={32} /></div> <p className="text-3xl font-black text-[#0F3D3E] tracking-tight">+1 416-555-0199</p></div>
                 </div>
                 <div>
                    <span className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-[0.4em] mb-6 block">Email Concierge</span>
                    <div className="flex items-center gap-8 group cursor-pointer"><div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-[#0F3D3E] group-hover:bg-[#F5A623] group-hover:text-white transition-all"><Mail size={32} /></div> <p className="text-3xl font-black text-[#0F3D3E] tracking-tight">concierge@niagaratours.ca</p></div>
                 </div>
                 <div className="pt-12">
                    <p className="text-stone-400 font-medium max-w-sm">Our concierge desk is available 24/7 for premium members and from 8AM to 8PM EST for general inquiries.</p>
                 </div>
               </div>
               <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-stone-100 text-left relative">
                 <div className="absolute -top-6 -right-6 bg-[#F5A623] w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform rotate-12"><Wind className="text-white" /></div>
                 <h3 className="text-2xl font-black text-[#0F3D3E] uppercase mb-8">Quick Inquiry</h3>
                 <form className="space-y-6" onSubmit={e => { e.preventDefault(); setErrorMsg("Message received. We will contact you shortly."); }}>
                    <input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" placeholder="Name" />
                    <input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" placeholder="Email" />
                    <textarea required rows="4" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none border border-stone-100 focus:border-[#F5A623]" placeholder="How can we assist?"></textarea>
                    <button className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-[#F5A623] transition-all">Send Message</button>
                 </form>
               </div>
             </div>
          </section>
        )}

        {view === 'booking' && (
          <section className="py-32 px-6 bg-[#FDFDF9]">
            <BookingForm 
              tour={selectedTour} 
              onSubmit={handleBookingSubmit} 
              onCancel={() => setView('home')} 
              isSubmitting={isSubmitting}
            />
          </section>
        )}

        {view === 'success' && (
          <section className="py-48 text-center animate-fade-in px-6">
            <div className="w-32 h-32 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <CheckCircle className="text-white" size={64} />
            </div>
            <h2 className="text-7xl md:text-[9rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-6">Confirmed.</h2>
            <p className="text-2xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">Your expedition is officially reserved. A detailed itinerary and digital boarding pass have been dispatched to your email.</p>
            <div className="mt-16 flex flex-wrap justify-center gap-6">
              <button onClick={() => setView('home')} className="bg-[#0F3D3E] text-white px-12 py-6 rounded-full font-black uppercase shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Return Home</button>
              <button className="bg-stone-100 text-[#0F3D3E] px-12 py-6 rounded-full font-black uppercase">Print Receipt</button>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0F3D3E] text-white py-32 px-6 text-center mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <Logo light />
          </div>
          <div className="flex justify-center gap-12 my-16">
            <Instagram className="text-[#F5A623] cursor-pointer hover:scale-125 transition-transform" />
            <Facebook className="text-[#F5A623] cursor-pointer hover:scale-125 transition-transform" />
            <Twitter className="text-[#F5A623] cursor-pointer hover:scale-125 transition-transform" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left border-t border-white/10 pt-16 mb-20 max-w-4xl mx-auto">
             <div>
               <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623] mb-4">Toronto HQ</p>
               <p className="text-sm opacity-60 leading-loose">142 Queens Quay East<br/>Toronto, ON M5V 3Z1<br/>Canada</p>
             </div>
             <div>
               <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623] mb-4">Explore</p>
               <ul className="text-sm opacity-60 space-y-2">
                 <li className="cursor-pointer hover:text-white">Gift Certificates</li>
                 <li className="cursor-pointer hover:text-white">Corporate Charters</li>
                 <li className="cursor-pointer hover:text-white">Partner Program</li>
               </ul>
             </div>
             <div>
               <p className="text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623] mb-4">Support</p>
               <ul className="text-sm opacity-60 space-y-2">
                 <li className="cursor-pointer hover:text-white">Privacy Policy</li>
                 <li className="cursor-pointer hover:text-white">Terms of Voyage</li>
                 <li className="cursor-pointer hover:text-white">Health & Safety</li>
               </ul>
             </div>
          </div>
          <p className="text-[0.55rem] font-black uppercase tracking-[0.4em] opacity-30">© 2026 Niagara Tours Canada • A Premier Luxury Excursion Provider</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #FDFDF9; }
        ::-webkit-scrollbar-thumb { background: #0F3D3E; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #F5A623; }
      `}} />
    </div>
  );
}