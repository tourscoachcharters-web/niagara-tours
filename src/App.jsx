import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Menu, X, Users, Star, Compass, 
  Image as ImageIcon, ChevronDown, MapPin, 
  ArrowRight, ShieldCheck, Waves, Instagram, 
  Facebook, Twitter, Mail, Phone, CheckCircle,
  Calendar, CreditCard, Camera, Leaf, Play,
  Coffee, Wine, Map, Sparkles, Utensils, HelpCircle,
  Plus, MessageSquare, Quote
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

// --- SEO & Meta Component ---
const MetaTags = ({ view, tourName }) => {
  useEffect(() => {
    let title = "Niagara Tours | Luxury Niagara Falls Tours from Toronto";
    let description = "Experience the best Niagara Falls tours in Canada. Premium small-group sightseeing, luxury wine tours, and private helicopter tours from Toronto.";

    if (view === 'tours') {
      title = "Niagara Falls Tour Packages | Niagara Tours";
      description = "Browse our curated collection of Niagara Falls sightseeing packages. From Hornblower boat cruises to historic Niagara-on-the-Lake wine tours.";
    } else if (view === 'detail' && tourName) {
      title = `${tourName} - Luxury Niagara Falls Experience`;
      description = `Book the ${tourName}. A premium Niagara Falls tour featuring VIP access, expert guides, and a complete luxury itinerary.`;
    } else if (view === 'about') {
      title = "Our Heritage | The Best Niagara Falls Tour Operator since 1994";
      description = "Learn about Niagara Tours. We provide the most sophisticated and highly-rated luxury excursions to the Niagara region from Toronto.";
    } else if (view === 'reviews') {
      title = "Guest Reviews & Testimonials | Niagara Tours";
      description = "Read authentic reviews from travelers who experienced our luxury Niagara Falls tours. See why we are the #1 rated operator in Ontario.";
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
  }, [view, tourName]);

  return null;
};

// --- Helper Components ---

const SafeImage = ({ src, alt, className, style }) => {
  const [error, setError] = useState(false);
  const isExternal = src && (src.startsWith('http') || src.includes('unsplash.com'));
  const cleanSrc = (isExternal && src.includes('unsplash.com')) ? src.split('?')[0] + "?auto=format&w=1200&q=75" : src;
  
  if (!src || error) {
    return (
      <div className={`${className} bg-stone-200 flex flex-col items-center justify-center p-4`} style={style}>
        <ImageIcon className="text-stone-400 mb-2" size={32} />
        <span className="text-[0.6rem] font-bold text-stone-500 uppercase tracking-widest text-center">
          Upload {src?.replace('/', '') || 'Image'}
        </span>
      </div>
    );
  }
  return <img src={cleanSrc} alt={alt || "Niagara Falls Luxury Tour"} className={className} style={style} onError={() => setError(true)} />;
};

const Logo = ({ light = false }) => (
  <div className="flex flex-col text-left select-none">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#F5A623] rounded-xl flex items-center justify-center shadow-lg shrink-0">
        <Compass color={light ? "white" : "#0F3D3E"} size={22} />
      </div>
      <span className={`text-2xl font-black tracking-tighter ${light ? 'text-white' : 'text-[#0F3D3E]'}`}>NIAGARA</span>
    </div>
    <div className="mt-1 flex items-center gap-2">
      <div className="h-px bg-[#F5A623] w-4" />
      <span className="text-[0.45rem] font-black tracking-[0.25em] text-[#F5A623] uppercase whitespace-nowrap">
        Operational Status: All Sites Open
      </span>
    </div>
  </div>
);

const Nav = ({ setView, activeView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const links = [
    { id: 'home', label: 'Overview' },
    { id: 'tours', label: 'Tours' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'Heritage' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Concierge' }
  ];
  const handleNav = (id) => {
    if (['gallery'].includes(id)) return;
    setView(id);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };
  return (
    <header className="fixed top-0 left-0 w-full bg-[#0F3D3E] border-b border-white/5 z-[100]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
        <button onClick={() => handleNav('home')} className="hover:opacity-80 transition-opacity"><Logo light={true} /></button>
        <nav className="hidden xl:flex items-center gap-10">
          {links.map(link => (
            <button key={link.id} onClick={() => handleNav(link.id)} className={`text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all relative group py-2 ${activeView === link.id ? 'text-[#F5A623]' : 'text-white/70 hover:text-white'}`}>
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F5A623] transition-all ${activeView === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <button onClick={() => handleNav('tours')} className="hidden md:block px-8 py-3 rounded-full text-[0.65rem] font-black uppercase tracking-widest bg-white text-[#0F3D3E] hover:bg-[#F5A623] hover:text-white transition-all shadow-xl active:scale-95">Book Now</button>
          <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-colors">{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </div>
      {isOpen && (
        <div className="xl:hidden absolute top-full left-0 w-full bg-[#0F3D3E] shadow-2xl p-8 border-t border-white/5 flex flex-col gap-6 animate-fade-in text-left text-white">
          {links.map(link => (
            <button key={link.id} onClick={() => handleNav(link.id)} className={`text-left text-xl font-black uppercase tracking-tighter ${activeView === link.id ? 'text-[#F5A623]' : 'text-white/70'}`}>{link.label}</button>
          ))}
          <button onClick={() => handleNav('tours')} className="w-full bg-[#F5A623] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Reserve Tour</button>
        </div>
      )}
    </header>
  );
};

const ReviewCard = ({ review }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full text-left">
    <div className="flex items-center gap-1 mb-6 text-[#F5A623]">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
      ))}
    </div>
    <Quote className="text-stone-100 mb-4" size={40} />
    <p className="text-stone-600 text-lg leading-relaxed mb-8 flex-grow italic">"{review.comment}"</p>
    <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
      <div>
        <h4 className="font-black text-[#0F3D3E] uppercase tracking-tighter text-sm">{review.name}</h4>
        <p className="text-[0.6rem] font-bold text-[#F5A623] uppercase tracking-widest">Verified Traveler</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center">
         <CheckCircle size={14} className="text-stone-300" />
      </div>
    </div>
  </div>
);

const TourCard = ({ tour, onSelect }) => (
  <article className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100/50 text-left">
    <div className="h-80 relative overflow-hidden">
      <SafeImage src={tour.image} alt={`${tour.name} - Best Niagara Falls Tours`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest text-[#0F3D3E] z-10">{tour.category}</div>
      <div className="absolute bottom-6 left-6 text-white z-10">
        <div className="text-2xl font-black tracking-tighter mb-1">${tour.price} <span className="text-sm font-normal opacity-70">/ PP</span></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
    </div>
    <div className="p-10 flex-grow flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 line-clamp-1">{tour.name}</h3>
        <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-2">{tour.description}</p>
        <div className="flex flex-wrap gap-6 mb-10 text-stone-400">
           <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Clock size={14} className="text-[#F5A623]" /> {tour.duration}</div>
           <div className="flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-widest"><Users size={14} className="text-[#F5A623]" /> {tour.capacity} Seats</div>
        </div>
      </div>
      <button onClick={() => onSelect(tour)} className="w-full bg-[#0F3D3E] text-white py-4 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-[#F5A623] transition-all">View Details</button>
    </div>
  </article>
);

const BookingForm = ({ tour, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({ name: '', email: '', date: '', guests: 1 });
  return (
    <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl border border-stone-100 animate-fade-in text-left">
      <div className="mb-10">
        <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-2 block">Reservation for</span>
        <h2 className="text-4xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">{tour?.name || "Bespoke Tour"}</h2>
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
          <button disabled={isSubmitting} type="submit" className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-xl disabled:opacity-50">{isSubmitting ? 'Processing...' : 'Confirm Reservation'}</button>
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
  const [reviews, setReviews] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- TOURS FETCH/SEED ---
  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    return onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { 
            name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", 
            description: "Experience the ultimate Niagara Falls tour from Toronto. A full-day luxury sightseeing journey through historic Niagara-on-the-Lake and the Horseshoe Falls.",
            highlights: ["Heritage Sightseeing", "Elite Vineyard Access", "Brink Observation", "Luxury Coach Transit"],
            included: ["Certified Local Guide", "3-Course Winery Lunch", "Fast-Track Entry", "Bottled Water"],
            itinerary: [
              { time: "08:30 AM", event: "Toronto Departure", desc: "Board our executive coach for a luxury day trip to Niagara Falls." },
              { time: "10:30 AM", event: "Niagara-on-the-Lake", desc: "Explore Canada's most historic and beautiful town." },
              { time: "12:30 PM", event: "Gourmet Lunch", desc: "Seated dining at a premier Niagara vineyard." },
              { time: "03:00 PM", event: "Falls Experience", desc: "Unobstructed views from the brink of the Falls." }
            ],
            faqs: [{ q: "Are tours from Toronto daily?", a: "Yes, we offer premium daily departures from Union Station and major hotels." }],
            image: "/tour-1.jpg" 
          },
          { 
            name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours",
            description: "The best Niagara Falls night tour. Watch the illumination show after a gourmet dinner with unobstructed Falls views.",
            highlights: ["Night Light Show", "Golden Hour Views", "Fine Dining Experience", "Luxury Chauffeur"],
            included: ["Fallsview Seating", "Illumination Access", "Gourmet Dinner", "VIP Scenic View"],
            itinerary: [
              { time: "03:30 PM", event: "Afternoon Pickup", desc: "Luxury transit to the Falls for the sunset transition." },
              { time: "07:00 PM", event: "Fallsview Dinner", desc: "High-end dining with the world's best waterfall view." }
            ],
            faqs: [{ q: "Is this tour romantic?", a: "It is our #1 rated tour for couples and special occasions in Niagara." }],
            image: "/tour-2.jpg" 
          }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
  }, [user]);

  // --- REVIEWS FETCH/SEED ---
  useEffect(() => {
    if (!user) return;
    const reviewsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'reviews');
    return onSnapshot(reviewsCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { name: "James W.", rating: 5, comment: "The helicopter ride was breathtaking! I've lived in Toronto for 10 years and never seen the Falls like this. Truly luxury service from start to finish.", createdAt: serverTimestamp() },
          { name: "Sarah L.", rating: 5, comment: "Excellent wine selection on the Sommelier tour. Our guide was incredibly knowledgeable. The farm-to-table lunch was a highlight of our trip.", createdAt: serverTimestamp() },
          { name: "Robert M.", rating: 5, comment: "A bit wet on the adventure tour, but well worth it! VIP boarding saved us at least 2 hours of waiting in line. Professional staff.", createdAt: serverTimestamp() },
          { name: "Elena G.", rating: 4, comment: "The Sunset Illumination tour is highly recommended for couples. The dinner view was spectacular. Everything was perfectly timed.", createdAt: serverTimestamp() }
        ];
        seed.forEach(r => addDoc(reviewsCollection, r));
      } else {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory by date (newest first)
        setReviews(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      }
    });
  }, [user]);

  const handleBooking = async (data) => {
    setIsSubmitting(true);
    try {
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
      await addDoc(bookingsRef, { ...data, tourId: selectedTour?.id, tourName: selectedTour?.name, userId: user.uid, createdAt: serverTimestamp() });
      setView('success');
      window.scrollTo(0,0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) return;
    setIsSubmitting(true);
    try {
      const reviewsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'reviews');
      await addDoc(reviewsCollection, { ...reviewData, userId: user.uid, createdAt: serverTimestamp() });
      setReviewData({ name: '', rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col font-sans selection:bg-[#F5A623]/30 pt-[100px] text-left">
      <MetaTags view={view} tourName={selectedTour?.name} />
      <Nav setView={setView} activeView={view} />
      
      <main className="flex-grow">
        {/* HOME VIEW */}
        {view === 'home' && (
          <>
            <section className="relative w-full overflow-hidden bg-black">
              <div className="relative h-[85vh] w-full">
                <SafeImage src="/hero.jpg" alt="Luxury Niagara Falls Tours Canada" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }} />
                <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center animate-slide-up">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="max-w-4xl pt-10">
                      <h1 className="text-white font-black text-6xl md:text-[9.5rem] uppercase leading-[0.8] tracking-tighter mb-10">Luxury <br/><span className="text-[#F5A623]">Niagara.</span></h1>
                      <p className="text-white/90 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mb-12">Experience the <span className="text-[#F5A623] font-bold">best Niagara Falls tours from Toronto</span>. Luxury small-group sightseeing with VIP access to Hornblower cruises and historic wineries.</p>
                      <div className="flex flex-wrap gap-6">
                        <button onClick={() => setView('tours')} className="bg-[#F5A623] text-black px-12 py-5 rounded-xl font-black uppercase text-[0.8rem] tracking-[0.2em] shadow-2xl hover:bg-white transition-all">Book Tour</button>
                        <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-xl font-black uppercase text-[0.8rem] tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-3"><Play size={18} fill="currentColor" /> Visual Proof</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
              <header className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="text-left"><span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Hand-Selected Itineraries</span><h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Signature Sightseeing</h2></div>
                <button onClick={() => setView('tours')} className="flex items-center gap-2 text-[#0F3D3E] font-bold uppercase text-[0.65rem] tracking-widest group">Browse All Packages <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" /></button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {tours.slice(0, 6).map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}
              </div>
            </section>
          </>
        )}

        {/* REVIEWS VIEW */}
        {view === 'reviews' && (
          <section className="animate-fade-in py-12 pb-32">
             <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-32">
                <div className="grid lg:grid-cols-2 gap-24 items-end">
                   <div>
                      <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.4em] mb-6 block">Our Community</span>
                      <h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-12">Reviews.</h1>
                      <div className="flex items-center gap-4 text-[#0F3D3E]">
                         <div className="flex gap-1 text-[#F5A623]">
                            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" strokeWidth={0} />)}
                         </div>
                         <p className="text-2xl font-black tracking-tighter uppercase">5.0 Average Rating</p>
                      </div>
                   </div>
                   <div className="bg-[#0F3D3E] p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                      <Sparkles className="absolute -top-10 -right-10 text-white/5" size={200} />
                      <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                         <MessageSquare className="text-[#F5A623]" size={28} /> Share Your Experience
                      </h3>
                      <form onSubmit={submitReview} className="space-y-6 relative z-10">
                         <div className="grid md:grid-cols-2 gap-6">
                            <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#F5A623] outline-none transition-all" placeholder="Your Name" value={reviewData.name} onChange={e => setReviewData({...reviewData, name: e.target.value})} />
                            <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#F5A623] outline-none transition-all appearance-none" value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: parseInt(e.target.value)})}>
                               {[5,4,3,2,1].map(n => <option key={n} value={n} className="text-black">{n} Stars</option>)}
                            </select>
                         </div>
                         <textarea required rows="4" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#F5A623] outline-none transition-all" placeholder="Your thoughts on the tour..." value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})}></textarea>
                         <button disabled={isSubmitting} className="w-full bg-[#F5A623] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-xl">
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                         </button>
                      </form>
                   </div>
                </div>
             </div>

             <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
             </div>
          </section>
        )}

        {/* TOURS LIST VIEW */}
        {view === 'tours' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto text-left animate-fade-in">
            <header className="mb-20">
              <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">The Full Catalog</span>
              <h1 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Niagara Falls Tour Packages</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">{tours.map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}</div>
          </section>
        )}

        {/* TOUR DETAIL VIEW */}
        {view === 'detail' && selectedTour && (
          <section className="animate-fade-in pb-32">
            <div className="relative h-[70vh] w-full bg-black">
              <SafeImage src={selectedTour.image} alt={selectedTour.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
              <div className="absolute inset-0 flex items-end"><div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full pb-20"><button onClick={() => setView('tours')} className="text-white/60 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest mb-8 flex items-center gap-2"><ArrowRight size={14} className="rotate-180" /> Back to Packages</button><span className="bg-[#F5A623] text-[#0F3D3E] px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest mb-6 inline-block">{selectedTour.category} Tour</span><h1 className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">{selectedTour.name}</h1></div></div>
            </div>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 grid grid-cols-1 lg:grid-cols-3 gap-24">
              <div className="lg:col-span-2 space-y-24">
                <div>
                   <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-6">Experience Highlights</h3>
                   <p className="text-3xl md:text-4xl font-medium text-[#0F3D3E] leading-tight italic border-l-[12px] border-[#F5A623] pl-12">{selectedTour.description}</p>
                </div>
                <div>
                  <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-stone-400 mb-12 flex items-center gap-4"><Clock size={20} className="text-[#F5A623]" /> Detailed Tour Itinerary</h3>
                  <div className="space-y-12 pl-4 border-l-2 border-stone-100 ml-2">
                    {selectedTour.itinerary?.map((item, idx) => (
                      <div key={idx} className="relative pl-12 group">
                        <div className="absolute -left-[2.35rem] top-0 w-8 h-8 rounded-full bg-[#FDFDF9] border-2 border-stone-100 flex items-center justify-center text-[0.6rem] font-black text-[#F5A623] transition-colors">{idx + 1}</div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3"><span className="text-[0.7rem] font-black text-[#F5A623] uppercase tracking-widest">{item.time}</span><div className="h-px bg-stone-100 flex-grow" /></div>
                           <h4 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter">{item.event}</h4>
                           <p className="text-stone-500 text-lg leading-relaxed max-w-2xl">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-stone-100 sticky top-32 text-left">
                  <div className="mb-12 pb-12 border-b border-stone-100 space-y-6">
                    <div className="flex justify-between items-end"><p className="text-stone-400 text-[0.65rem] font-black uppercase tracking-widest">Premium Fare</p><p className="text-5xl font-black text-[#0F3D3E] tracking-tighter">${selectedTour.price} <span className="text-sm font-normal text-stone-400 uppercase tracking-widest">Per Guest</span></p></div>
                  </div>
                  <button onClick={() => { setView('booking'); window.scrollTo(0,0); }} className="w-full bg-[#0F3D3E] text-white py-8 rounded-[2rem] font-black uppercase text-[0.8rem] tracking-[0.2em] shadow-2xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Request Reservation</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOOKING VIEW */}
        {view === 'booking' && (
          <section className="pt-12 pb-32 px-6"><BookingForm tour={selectedTour} onSubmit={handleBooking} onCancel={() => setView('tours')} isSubmitting={isSubmitting} /></section>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && (
          <section className="py-72 text-center animate-fade-in px-10"><div className="w-32 h-32 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-16 shadow-2xl"><CheckCircle className="text-white" size={72} /></div><h2 className="text-7xl md:text-[11rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-12">Confirmed.</h2><p className="text-3xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">Your tour has been secured. Our concierge will be in touch shortly with your boarding credentials.</p><button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="mt-20 bg-[#0F3D3E] text-white px-20 py-9 rounded-full font-black uppercase transition-all hover:bg-[#F5A623] shadow-2xl tracking-[0.3em] text-base">Return Home</button></section>
        )}

        {/* ABOUT VIEW */}
        {view === 'about' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-4xl mx-auto animate-fade-in text-left">
            <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Founded 1994</span>
            <h1 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-12 leading-none">Our Heritage.</h1>
            <p className="text-3xl text-[#0F3D3E] font-bold leading-tight mb-16 border-l-[12px] border-[#F5A623] pl-12">Niagara Tours was born from a simple realization: the world's most powerful natural wonder deserved a sophisticated audience.</p>
            <div className="space-y-12 text-2xl text-stone-500 leading-relaxed font-medium"><p>We began with a single executive coach and a vision to replace the typical "tourist bus" with a storytelling journey. Today, we are proud to be Toronto's premier luxury operator.</p></div>
          </section>
        )}

        {/* CONTACT VIEW */}
        {view === 'contact' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto animate-fade-in text-left">
            <h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-24 leading-none">Concierge.</h1>
            <div className="grid lg:grid-cols-2 gap-32">
              <div className="space-y-16">
                <div className="flex items-center gap-10 group"><div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Phone size={40} /></div><div><p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Direct Line</p><p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">+1 416-555-0199</p></div></div>
                <div className="flex items-center gap-10 group"><div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Mail size={40} /></div><div><p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Inquiry</p><p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">hello@niagaratours.ca</p></div></div>
              </div>
              <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-stone-100">
                <h3 className="text-3xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter">Direct Dispatch</h3>
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); setView('success'); window.scrollTo(0,0); }}><input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Your Name" /><input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Email Address" /><textarea required rows="4" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="How can we assist you?"></textarea><button className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Send Message</button></form>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0F3D3E] text-white pt-32 pb-16 px-6">
        <div className="max-w-[1440px] mx-auto text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20 border-b border-white/10 pb-20">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start"><Logo light /><p className="mt-8 text-white/40 text-sm leading-relaxed max-w-xs">The <span className="text-white font-bold">best Niagara Falls tours in Canada</span>. Since 1994, providing discerning travelers with bespoke access to natural wonders.</p></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Company</h4><ul className="space-y-4 text-sm text-white/60"><li onClick={() => { setView('about'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors">Our Heritage</li><li onClick={() => { setView('contact'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors">Contact Us</li><li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li><li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li></ul></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Connect</h4><ul className="space-y-4 text-sm text-white/60"><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><MapPin size={16} /> Toronto, ON</li><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><Instagram size={16} /> @NiagaraTours</li><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><Facebook size={16} /> Niagara Tours</li></ul></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Newsletter</h4><p className="text-white/40 text-xs mb-8">Exclusive Niagara Falls sightseeing insights and seasonal offers.</p><div className="flex flex-col gap-3"><input className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#F5A623] transition-all" placeholder="Email address" /><button className="bg-[#F5A623] text-[#0F3D3E] py-4 rounded-xl font-black uppercase text-[0.6rem] tracking-widest shadow-xl">Subscribe</button></div></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10"><p className="text-[0.55rem] font-bold uppercase tracking-[0.5em] text-white/20">© 2026 Niagara Tours Canada • Premium Toronto to Niagara Excursions</p><div className="flex gap-10 text-[0.55rem] font-bold uppercase tracking-widest text-white/20"><span className="hover:text-white/60 cursor-pointer">Privacy Policy</span><span className="hover:text-white/60 cursor-pointer">Terms of Service</span></div></div>
        </div>
      </footer>

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
