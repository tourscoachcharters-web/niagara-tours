import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Menu, X, Users, Star, Compass, 
  Image as ImageIcon, ChevronDown, MapPin, 
  ArrowRight, ShieldCheck, Waves, Instagram, 
  Facebook, Twitter, Mail, Phone, CheckCircle,
  Calendar, CreditCard
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
    <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0 shrink-0">
      <Compass color={light ? "white" : "#0F3D3E"} size={22} />
    </div>
    <div className="flex flex-col text-left leading-none">
      <span className={`text-xl font-black tracking-tighter ${light ? 'text-white' : 'text-[#0F3D3E]'}`}>NIAGARA</span>
      <span className="text-[0.55rem] font-bold tracking-[0.4em] text-[#F5A623] uppercase whitespace-nowrap">Expeditions</span>
    </div>
  </div>
);

const Nav = ({ setView, activeView, scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Overview' },
    { id: 'tours', label: 'Expeditions' },
    { id: 'about', label: 'Our Heritage' },
    { id: 'contact', label: 'Concierge' }
  ];

  const handleNav = (id) => {
    setView(id);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  const isLight = (activeView === 'home' || activeView === 'detail') && !scrolled;

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <button onClick={() => handleNav('home')} className="hover:opacity-80 transition-opacity">
          <Logo light={isLight} />
        </button>

        <div className="hidden md:flex items-center gap-10">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleNav(link.id)}
              className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] transition-all relative group
                ${isLight ? 'text-white/80 hover:text-white' : 'text-[#0F3D3E]/70 hover:text-[#0F3D3E]'}
              `}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#F5A623] transition-all ${activeView === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
          <button 
            onClick={() => handleNav('tours')}
            className={`px-7 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95
              ${isLight ? 'bg-white text-[#0F3D3E]' : 'bg-[#0F3D3E] text-white'}
            `}
          >
            Book Now
          </button>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`md:hidden p-2 rounded-xl transition-colors ${
            isLight ? 'text-white hover:bg-white/10' : 'text-[#0F3D3E] hover:bg-[#0F3D3E]/5'
          }`}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl p-8 border-t border-stone-100 flex flex-col gap-6 animate-fade-in">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleNav(link.id)} 
              className={`text-left text-xl font-black uppercase tracking-tighter ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => handleNav('tours')} className="w-full bg-[#0F3D3E] text-white py-4 rounded-xl font-bold uppercase tracking-widest">
            Instant Booking
          </button>
        </div>
      )}
    </nav>
  );
};

// --- View Components ---

const TourCard = ({ tour, onSelect }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100/50">
    <div className="h-80 relative overflow-hidden">
      <SafeImage src={tour.image} alt={tour.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest text-[#0F3D3E] z-10">{tour.category}</div>
      <div className="absolute bottom-6 left-6 text-white z-10">
        <div className="text-2xl font-black tracking-tighter mb-1">${tour.price} <span className="text-sm font-normal opacity-70">/ PP</span></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
    </div>
    <div className="p-10 flex-grow flex flex-col justify-between text-left">
      <div>
        <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4">{tour.name}</h3>
        <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-2">
          {tour.description}
        </p>
        <div className="flex flex-wrap gap-6 mb-10 text-stone-400">
           <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Clock size={14} className="text-[#F5A623]" /> {tour.duration}</div>
           <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Users size={14} className="text-[#F5A623]" /> {tour.capacity} Seats</div>
        </div>
      </div>
      <button onClick={() => onSelect(tour)} className="w-full bg-[#0F3D3E] text-white py-4 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-[#F5A623] transition-all">
        View Expedition
      </button>
    </div>
  </div>
);

const BookingForm = ({ tour, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', date: '', guests: 1 });
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl border border-stone-100 animate-fade-in text-left">
      <div className="mb-10">
        <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-2 block">Reservation for</span>
        <h2 className="text-4xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">{tour?.name || "Bespoke Expedition"}</h2>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-2">Full Name</label>
          <input required className="w-full bg-[#FDFDF9] p-5 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Alexander Knight" />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-2">Email Address</label>
          <input required type="email" className="w-full bg-[#FDFDF9] p-5 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="alex@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-2">Travel Date</label>
            <input required type="date" className="w-full bg-[#FDFDF9] p-5 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-2">Travelers</label>
            <select className="w-full bg-[#FDFDF9] p-5 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all appearance-none" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-4">
          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-xl disabled:opacity-50">
            {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
          </button>
          <button type="button" onClick={onCancel} className="w-full text-stone-400 font-bold uppercase tracking-widest text-[0.6rem] mt-6 hover:text-red-500 transition-colors">Cancel & Return</button>
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
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", description: "A flagship full-day journey through historic villages, world-class wineries, and the mighty Horseshoe Falls.", itinerary: ["Toronto Departure", "Niagara-on-the-Lake Stop", "Winery Tasting", "Falls Illumination Viewing"], image: "https://images.unsplash.com/photo-1549413240-3b9560376d54" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", description: "Experience the magic of the falls at twilight followed by an elite 3-course dinner overlooking the water.", itinerary: ["Afternoon Departure", "Table Rock Scenic Stop", "Gourmet Dinner", "Light Show Experience"], image: "https://images.unsplash.com/photo-1552600213-90d571871a2e" },
          { name: "Aerial Majesty", price: 499, category: "Luxury", capacity: 4, duration: "2 Hours", description: "The ultimate perspective. A private helicopter tour over the entire Niagara region including the Whirlpool Rapids.", itinerary: ["Private Terminal Pickup", "Champagne Welcome", "45-minute Flight", "Executive Drop-off"], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29" }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
  }, [user]);

  const handleBooking = async (data) => {
    setIsSubmitting(true);
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, { 
        ...data, 
        tourId: selectedTour?.id, 
        tourName: selectedTour?.name, 
        userId: user.uid, 
        createdAt: serverTimestamp() 
      });
      setView('success');
      window.scrollTo(0,0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col font-sans selection:bg-[#F5A623]/30">
      <Nav setView={setView} activeView={view} scrolled={scrolled} />
      
      <main className="flex-grow">
        {/* HOME VIEW */}
        {view === 'home' && (
          <>
            <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.5)' }} />
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 text-left animate-slide-up">
                <div className="flex items-center gap-3 mb-6 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                  <Star size={14} color="#F5A623" fill="#F5A623" />
                  <span className="text-white text-[0.55rem] font-bold uppercase tracking-[0.3em]">Canada's Leading Luxury Operator</span>
                </div>
                <h1 className="text-white font-black text-6xl md:text-[9rem] uppercase leading-[0.85] tracking-tighter mb-8">
                  Feel the <br/><span className="text-[#F5A623]">Greatness.</span>
                </h1>
                <p className="text-white/80 max-w-xl text-lg md:text-xl font-medium leading-relaxed mb-12">
                  Curated small-group departures from Toronto. Discover North America's iconic natural wonder through the lens of pure luxury.
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
            </section>

            <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="text-left">
                  <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Hand-Selected Itineraries</span>
                  <h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Signature Journeys</h2>
                </div>
                <button onClick={() => setView('tours')} className="flex items-center gap-2 text-[#0F3D3E] font-bold uppercase text-[0.65rem] tracking-widest group">
                  View All Collections <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {tours.slice(0, 3).map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}
              </div>
            </section>
          </>
        )}

        {/* TOURS LIST VIEW */}
        {view === 'tours' && (
          <section className="pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left">
            <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Seasonal Collections</span>
            <h1 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-20 leading-none">The Complete Catalog</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {tours.map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}
            </div>
          </section>
        )}

        {/* TOUR DETAIL VIEW */}
        {view === 'detail' && selectedTour && (
          <section className="animate-fade-in">
            <div className="relative h-[70vh] w-full">
              <SafeImage src={selectedTour.image} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-20 text-left">
                   <button onClick={() => setView('tours')} className="text-white/60 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                     <ArrowRight size={14} className="rotate-180" /> Back to Collections
                   </button>
                   <span className="bg-[#F5A623] text-[#0F3D3E] px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest mb-6 inline-block">
                     {selectedTour.category} Expedition
                   </span>
                   <h1 className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">{selectedTour.name}</h1>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 grid grid-cols-1 lg:grid-cols-3 gap-24 text-left">
              <div className="lg:col-span-2 space-y-12">
                <div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-stone-400 mb-6">The Experience</h3>
                  <p className="text-2xl md:text-3xl font-medium text-[#0F3D3E] leading-relaxed italic border-l-8 border-[#F5A623] pl-10">
                    {selectedTour.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-stone-400 mb-8">Itinerary Highlights</h3>
                  <div className="space-y-6">
                    {selectedTour.itinerary?.map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[0.7rem] font-black text-[#F5A623] shrink-0 border border-stone-200">
                          {idx + 1}
                        </div>
                        <p className="text-lg font-bold text-[#0F3D3E] pt-0.5">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 sticky top-32">
                  <div className="mb-10 pb-10 border-b border-stone-100 space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-stone-400 text-[0.6rem] font-bold uppercase tracking-widest">Rate</p>
                      <p className="text-4xl font-black text-[#0F3D3E] tracking-tighter">${selectedTour.price} <span className="text-sm font-normal">PP</span></p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-stone-400 text-[0.6rem] font-bold uppercase tracking-widest">Duration</p>
                      <p className="text-xl font-bold text-[#0F3D3E]">{selectedTour.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-10">
                     <div className="flex items-center gap-3 text-stone-500 text-sm font-medium"><ShieldCheck size={18} className="text-[#F5A623]" /> Certified Local Guide</div>
                     <div className="flex items-center gap-3 text-stone-500 text-sm font-medium"><CreditCard size={18} className="text-[#F5A623]" /> Instant Boarding Pass</div>
                     <div className="flex items-center gap-3 text-stone-500 text-sm font-medium"><Calendar size={18} className="text-[#F5A623]" /> 48h Flexible Cancellation</div>
                  </div>
                  <button 
                    onClick={() => { setView('booking'); window.scrollTo(0,0); }}
                    className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase text-[0.7rem] tracking-[0.2em] shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT VIEW */}
        {view === 'about' && (
          <section className="pt-40 pb-32 px-6 md:px-12 max-w-4xl mx-auto text-left animate-fade-in">
             <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Founded 1994</span>
             <h1 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-12 leading-none">Our Heritage.</h1>
             <p className="text-3xl text-[#0F3D3E] font-bold leading-tight mb-16 border-l-[12px] border-[#F5A623] pl-12">
               Niagara Expeditions was born from a simple realization: the world's most powerful natural wonder deserved a sophisticated audience.
             </p>
             <div className="space-y-12 text-2xl text-stone-500 leading-relaxed font-medium">
                <p>We began with a single executive coach and a vision to replace the typical "tourist bus" with a storytelling expedition. Today, we are proud to be Toronto's premier luxury operator.</p>
                <div className="grid grid-cols-2 gap-12 py-10 border-y border-stone-100">
                  <div>
                    <p className="text-5xl font-black text-[#F5A623] tracking-tighter">30+</p>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400">Years of Service</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-[#F5A623] tracking-tighter">150k</p>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400">Happy Travelers</p>
                  </div>
                </div>
                <p>Our commitment remains unchanged: strictly small groups, handpicked culinary partners, and guides who treat every guest like an honored member of our family.</p>
             </div>
          </section>
        )}

        {/* CONTACT VIEW */}
        {view === 'contact' && (
          <section className="pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left animate-fade-in">
             <h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-24 leading-none">Concierge.</h1>
             <div className="grid lg:grid-cols-2 gap-32">
                <div className="space-y-16">
                   <div className="flex items-center gap-10 group">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm">
                        <Phone size={40} />
                      </div> 
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Direct Line</p>
                        <p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">+1 416-555-0199</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-10 group">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm">
                        <Mail size={40} />
                      </div> 
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Inquiry</p>
                        <p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">hello@niagaratours.ca</p>
                      </div>
                   </div>
                   <div className="pt-12 border-t border-stone-100">
                     <p className="text-stone-400 font-medium">Our concierge desk is available 24/7 for premium members and from 8AM to 8PM EST for general inquiries.</p>
                   </div>
                </div>
                <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-stone-100">
                   <h3 className="text-3xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter">Direct Dispatch</h3>
                   <form className="space-y-6" onSubmit={e => { e.preventDefault(); setView('success'); window.scrollTo(0,0); }}>
                      <input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Your Name" />
                      <input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Email Address" />
                      <textarea required rows="4" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="How can we assist you?"></textarea>
                      <button className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Send Message</button>
                   </form>
                </div>
             </div>
          </section>
        )}

        {/* BOOKING VIEW */}
        {view === 'booking' && (
          <section className="pt-40 pb-32 px-6">
            <BookingForm 
              tour={selectedTour} 
              onSubmit={handleBooking} 
              onCancel={() => setView('tours')} 
              isSubmitting={isSubmitting} 
            />
          </section>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && (
          <section className="py-72 text-center animate-fade-in px-10">
            <div className="w-32 h-32 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-16 shadow-2xl">
              <CheckCircle className="text-white" size={72} />
            </div>
            <h2 className="text-7xl md:text-[11rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-12">Confirmed.</h2>
            <p className="text-3xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">Your expedition has been secured. Our concierge will be in touch shortly with your boarding credentials.</p>
            <button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="mt-20 bg-[#0F3D3E] text-white px-20 py-9 rounded-full font-black uppercase transition-all hover:bg-[#F5A623] shadow-2xl tracking-[0.3em] text-base">Return Home</button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F3D3E] text-white pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 text-left mb-20 border-b border-white/10 pb-20">
            <div className="col-span-1 md:col-span-1">
              <Logo light />
              <p className="mt-8 text-white/40 text-sm leading-relaxed max-w-xs">
                Since 1994, we have provided discerning travelers with bespoke access to Canada's most powerful natural wonders.
              </p>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Expeditions</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {tours.map(t => (
                  <li key={t.id} onClick={() => { setSelectedTour(t); setView('detail'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors line-clamp-1">{t.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Connect</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><MapPin size={16} /> Toronto, ON</li>
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Instagram size={16} /> @NiagaraExpeditions</li>
                <li className="flex items-center gap-3 hover:text-white cursor-pointer transition-colors"><Facebook size={16} /> Niagara Expeditions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Newsletter</h4>
              <p className="text-white/40 text-xs mb-8">Receive travel insights and exclusive seasonal offers.</p>
              <div className="flex flex-col gap-3">
                <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#F5A623] transition-all" placeholder="Email address" />
                <button className="bg-[#F5A623] text-[#0F3D3E] py-4 rounded-xl font-black uppercase text-[0.6rem] tracking-widest shadow-xl">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.5em] text-white/20">© 2026 Niagara Expeditions Canada • A Premier Luxury Operator</p>
            <div className="flex gap-10 text-[0.55rem] font-bold uppercase tracking-widest text-white/20">
              <span className="hover:text-white/60 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white/60 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(80px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
        body { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}