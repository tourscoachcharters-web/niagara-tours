import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Menu, X, Users, Star, Compass, 
  Image as ImageIcon, ChevronDown, MapPin, 
  ArrowRight, ShieldCheck, Waves, Instagram, 
  Facebook, Twitter, Mail, Phone, CheckCircle,
  Calendar, CreditCard, Camera, Leaf, MessageSquare,
  HelpCircle, ExternalLink, Filter, Play, Info,
  Droplets, Thermometer, Zap, Award
} from 'lucide-react';

// --- FIREBASE CONFIG (Unchanged) ---
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
      <span className="text-[0.55rem] font-bold tracking-[0.4em] text-[#F5A623] uppercase whitespace-nowrap">Tours</span>
    </div>
  </div>
);

const HorizontalNav = ({ setView, activeView, scrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Overview' },
    { id: 'tours', label: 'Expeditions' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'Heritage' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Concierge' },
  ];

  const handleNav = (id) => {
    setView(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLight = (activeView === 'home' || activeView === 'detail') && !scrolled;

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-sm py-4' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <button onClick={() => handleNav('home')} className="hover:opacity-80 transition-opacity">
          <Logo light={isLight} />
        </button>

        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleNav(link.id)}
              className={`text-[0.65rem] font-bold uppercase tracking-[0.25em] transition-all relative group py-2
                ${isLight ? 'text-white/70 hover:text-white' : 'text-[#0F3D3E]/60 hover:text-[#0F3D3E]'}
              `}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#F5A623] transition-all duration-300 ${activeView === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
          
          <button 
            onClick={() => handleNav('tours')}
            className={`px-8 py-3.5 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 active:scale-95
              ${isLight ? 'bg-white text-[#0F3D3E]' : 'bg-[#0F3D3E] text-white'}
            `}
          >
            Book Now
          </button>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className={`lg:hidden p-3 rounded-2xl transition-all ${
            isLight ? 'text-white hover:bg-white/10' : 'text-[#0F3D3E] hover:bg-[#0F3D3E]/5'
          }`}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`lg:hidden fixed inset-0 top-[88px] bg-white z-[90] transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="p-10 flex flex-col gap-10">
          {links.map(link => (
            <button 
              key={link.id} 
              onClick={() => handleNav(link.id)} 
              className={`text-left text-4xl font-black uppercase tracking-tighter flex items-center justify-between group ${activeView === link.id ? 'text-[#F5A623]' : 'text-[#0F3D3E]'}`}
            >
              {link.label}
              <ArrowRight className={`transition-transform duration-300 ${activeView === link.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 group-hover:opacity-50'}`} />
            </button>
          ))}
          <div className="mt-10 pt-10 border-t border-stone-100">
            <button 
              onClick={() => handleNav('tours')} 
              className="w-full bg-[#0F3D3E] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl"
            >
              Instant Reservation
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

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
      <div className="min-h-[220px]">
        <h3 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 h-[3rem] line-clamp-2 leading-none">{tour.name}</h3>
        <p className="text-stone-500 text-sm leading-relaxed mb-8 line-clamp-3">
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

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(tours.map(t => t.category))], [tours]);
  const filteredTours = useMemo(() => 
    activeCategory === 'All' ? tours : tours.filter(t => t.category === activeCategory),
    [tours, activeCategory]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) setUser(u);
      else {
        try { await signInAnonymously(auth); } catch (err) { console.error("Auth error", err); }
      }
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
      const masterSeed = [
        { 
          name: "King's Signature Day Experience", 
          price: 99, 
          category: "Heritage", 
          capacity: 48, 
          duration: "9 Hours", 
          description: "Toronto's premier full-day experience. Enjoy a scenic 1.5-hour drive with guided commentary, historical stops, and curated free time at the Falls.", 
          itinerary: ["Central Toronto Pickup", "Guided Scenic Drive", "Niagara-on-the-Lake", "Leisure Time at Table Rock"], 
          image: "https://images.unsplash.com/photo-1549413240-3b9560376d54" 
        },
        { 
          name: "The Hornblower Odyssey", 
          price: 147, 
          category: "Adventure", 
          capacity: 32, 
          duration: "10 Hours", 
          description: "The official cascading boat voyage included. Get up close to the thundering Horseshoe Falls on the iconic Hornblower Cruise.", 
          itinerary: ["Toronto Departure", "Guided Commentary", "VIP Hornblower Cruise", "Falls-view Exploration"], 
          image: "https://images.unsplash.com/photo-1510250672051-5b7d94f28585" 
        },
        { 
          name: "Ultimate Gorge Expedition", 
          price: 180, 
          category: "Adventure", 
          capacity: 24, 
          duration: "11 Hours", 
          description: "The most comprehensive package: includes both the Hornblower Boat Tour and Journey Behind the Falls bedrock tunnels.", 
          itinerary: ["Toronto Pickup", "Hornblower Boat Tour", "Journey Behind the Falls", "Clifton Hill Drop-off"], 
          image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29" 
        },
        { 
          name: "Skylon Summit Experience", 
          price: 139, 
          category: "Luxury", 
          capacity: 12, 
          duration: "8 Hours", 
          description: "Rise 775 feet above the falls for sweeping 360° views. Includes observation deck access and luxury transit.", 
          itinerary: ["Executive Car Pickup", "Scenic Parkway Drive", "Skylon Tower Observation", "Gourmet Lunch Stop"], 
          image: "https://images.unsplash.com/photo-1552600213-90d571871a2e" 
        },
        { 
          name: "WildPlay Zipline Rush", 
          price: 165, 
          category: "Extreme", 
          capacity: 10, 
          duration: "7 Hours", 
          description: "Soar 2,200 feet toward the base of the Horseshoe Falls. A pulse-quickening perspective for adrenaline seekers.", 
          itinerary: ["Adventure Fleet Pickup", "Safety Briefing", "Base-of-Falls Zipline", "Whirlpool Rapids Stop"], 
          image: "https://images.unsplash.com/photo-1519681393784-d120267923af" 
        },
        { 
          name: "Sunset Illumination & Dinner", 
          price: 159, 
          category: "Culinary", 
          capacity: 24, 
          duration: "6 Hours", 
          description: "Witness the falls at twilight followed by an elite 3-course dinner overlooking the illuminated water.", 
          itinerary: ["Afternoon Departure", "Table Rock Scenic Stop", "Gourmet Dinner", "Light Show Experience"], 
          image: "https://images.unsplash.com/photo-1552600213-90d571871a2e" 
        },
        { 
          name: "Sommelier's Estate Route", 
          price: 249, 
          category: "Culinary", 
          capacity: 8, 
          duration: "8 Hours", 
          description: "Visit four boutique estates with private tastings led by a Master Sommelier. farm-to-table lunch included.", 
          itinerary: ["Private Car Pickup", "Peller Estates Cellar", "Gourmet Garden Lunch", "Boutique Winery Stops"], 
          image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3" 
        },
        { 
          name: "Nature's Sanctuary Eco-Tour", 
          price: 139, 
          category: "Eco", 
          capacity: 14, 
          duration: "6 Hours", 
          description: "Explore the Butterfly Conservatory and the pristine trails of the Niagara Glen Nature Reserve.", 
          itinerary: ["Eco-Fleet Pickup", "Butterfly House Entry", "Guided Glen Hike", "Botanical Garden Picnic"], 
          image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef" 
        },
        { 
          name: "Historic Forts Trail", 
          price: 109, 
          category: "Heritage", 
          capacity: 20, 
          duration: "6 Hours", 
          description: "Walk the battlefields of the War of 1812. Deep dive into Fort George and Old Fort Erie military history.", 
          itinerary: ["Old Fort Erie Tour", "Military Reenactment", "Heritage Lunch", "Fort George Exploration"], 
          image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3" 
        },
        { 
          name: "Winter Ice Cathedral", 
          price: 149, 
          category: "Seasonal", 
          capacity: 12, 
          duration: "7 Hours", 
          description: "Witness the falls transformed into ice sculptures. Includes VIP access to the Festival of Lights.", 
          itinerary: ["Cozy Shuttle Pickup", "Frozen Falls Photography", "Hot Cocoa Tasting", "Festival of Lights"], 
          image: "https://images.unsplash.com/photo-1516934024742-b461fba47600" 
        },
        { 
          name: "Photographer's Golden Hour", 
          price: 299, 
          category: "Luxury", 
          capacity: 6, 
          duration: "5 Hours", 
          description: "Capture the falls at peak lighting with a pro landscape photographer. Access restricted vantage points.", 
          itinerary: ["Pro Equipment Brief", "Golden Hour Vantage", "Post-Processing Workshop", "Executive Drop-off"], 
          image: "https://images.unsplash.com/photo-1542332213-31f87348057f" 
        },
        { 
          name: "Fireworks Private Gala", 
          price: 349, 
          category: "Luxury", 
          capacity: 8, 
          duration: "5 Hours", 
          description: "Watch the sky ignite from a private balcony. Includes vintage champagne and fine hors d'oeuvres.", 
          itinerary: ["Limo Concierge Pickup", "Private Balcony Dining", "Fireworks Front Row", "Night Lights Tour"], 
          image: "https://images.unsplash.com/photo-1514525253344-99a4299966c2" 
        },
        { 
          name: "Clifton Hill Neon Adventure", 
          price: 115, 
          category: "Adventure", 
          capacity: 20, 
          duration: "5 Hours", 
          description: "Neon-lit midways, arcade fun, and the SkyWheel for skyline views. Perfect evening for families.", 
          itinerary: ["Afternoon Pickup", "SkyWheel Flight", "Neon Midway Pass", "Casual Bites at Hill"], 
          image: "https://images.unsplash.com/photo-1519681393784-d120267923af" 
        },
        { 
          name: "Whirlpool Rapids Jet Boat", 
          price: 199, 
          category: "Extreme", 
          capacity: 12, 
          duration: "3 Hours", 
          description: "Navigate the Class V Devil's Hole rapids. High-octane journey in an open-deck jet boat.", 
          itinerary: ["Safety Gear Setup", "Rapid Descent", "Whirlpool Spin", "Executive Transit Back"], 
          image: "https://images.unsplash.com/photo-1519681393784-d120267923af" 
        }
      ];

      if (snap.size < masterSeed.length) {
        // Automatically populate or update tours if the collection is smaller than expected
        masterSeed.forEach(t => {
          const docId = t.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          setDoc(doc(toursCollection, docId), t);
        });
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
      <HorizontalNav setView={setView} activeView={view} scrolled={scrolled} />
      
      <main className="flex-grow">
        {view === 'home' && (
          <div className="animate-fade-in">
            <section className="relative h-[100vh] flex flex-col justify-center overflow-hidden">
              <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda" className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom" style={{ filter: 'brightness(0.35)' }} />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
                <div className="text-left">
                  <div className="flex items-center gap-4 mb-8 bg-white/10 w-fit px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-[0.6rem] font-bold uppercase tracking-[0.3em]">Operational Status: All Sites Open</span>
                  </div>
                  
                  <h1 className="text-7xl md:text-[9.5rem] font-black text-white uppercase leading-[0.8] tracking-tighter mb-12 drop-shadow-2xl">
                    Primal <br/><span className="text-[#F5A623]">Energy.</span>
                  </h1>
                  
                  <p className="text-white/80 max-w-xl text-xl md:text-2xl font-medium leading-relaxed mb-14">
                    The Horseshoe Falls alone drops <span className="text-[#F5A623] font-black">600,000 gallons</span> of water every second. We take you closer than anyone else, with a level of luxury unmatched in the region.
                  </p>
                  
                  <div className="flex flex-wrap gap-6">
                    <button onClick={() => setView('tours')} className="bg-[#F5A623] text-[#0F3D3E] px-14 py-6 rounded-2xl font-black uppercase text-[0.75rem] tracking-[0.2em] shadow-2xl hover:bg-white transition-all hover:-translate-y-2">Book Expedition</button>
                    <button onClick={() => setView('gallery')} className="bg-white/10 backdrop-blur-xl text-white border border-white/30 px-14 py-6 rounded-2xl font-black uppercase text-[0.75rem] tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-3">
                      <Play size={18} fill="white" /> Visual Proof
                    </button>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col gap-8">
                   <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] transform rotate-2 hover:rotate-0 transition-transform duration-700">
                      <div className="flex items-center gap-4 mb-6">
                        <Droplets className="text-[#F5A623]" size={32} />
                        <h4 className="text-white text-xl font-black uppercase tracking-tighter">The Hydropower Legacy</h4>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium uppercase tracking-wide">
                        Since the late 19th century, the falls have powered the eastern seaboard. Our heritage tours include exclusive access to historic power stations.
                      </p>
                      <div className="flex gap-10">
                        <div><p className="text-white text-2xl font-black tracking-tight">4.9M</p><p className="text-white/30 text-[0.5rem] font-bold uppercase tracking-widest">Kilowatts Daily</p></div>
                        <div><p className="text-white text-2xl font-black tracking-tight">1881</p><p className="text-white/30 text-[0.5rem] font-bold uppercase tracking-widest">First Power Plant</p></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="absolute right-12 bottom-12 hidden xl:flex flex-col gap-6 text-right">
                <div className="space-y-1"><p className="text-[#F5A623] text-sm font-black tracking-widest uppercase">Location</p><p className="text-white/60 text-[0.65rem] font-bold uppercase tracking-[0.2em]">43.0896° N, 79.0849° W</p></div>
                <div className="space-y-1"><p className="text-[#F5A623] text-sm font-black tracking-widest uppercase">Flow Speed</p><p className="text-white/60 text-[0.65rem] font-bold uppercase tracking-[0.2em]">65 KM / Hour (Peak)</p></div>
              </div>
            </section>
            
            <section className="py-32 px-6 md:px-12 bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FDFDF9] -z-0" />
               <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
                  <div className="lg:col-span-5 space-y-10">
                    <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.5em] mb-4 block">The Expedition Matrix</span>
                    <h2 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Magnificence <br/>by the <span className="text-[#F5A623]">Numbers.</span></h2>
                    <p className="text-stone-500 text-lg leading-relaxed font-medium">
                      Understand the sheer scale of the three falls—The American, Bridal Veil, and the massive Horseshoe. Our expert guides translate these statistics into an unforgettable sensory journey.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100">
                        <Thermometer size={24} className="text-[#F5A623] mb-4" />
                        <p className="text-3xl font-black text-[#0F3D3E] tracking-tight">51 Meters</p>
                        <p className="text-stone-400 text-[0.6rem] font-bold uppercase tracking-widest mt-1">Vertical Drop</p>
                      </div>
                      <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100">
                        <Zap size={24} className="text-[#F5A623] mb-4" />
                        <p className="text-3xl font-black text-[#0F3D3E] tracking-tight">12,000 Yrs</p>
                        <p className="text-stone-400 text-[0.6rem] font-bold uppercase tracking-widest mt-1">Since Formation</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative h-[500px] rounded-[3.5rem] overflow-hidden group shadow-2xl">
                       <SafeImage src="https://images.unsplash.com/photo-1510250672051-5b7d94f28585" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D3E] via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-10 left-10 text-white">
                          <p className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-widest mb-2">Perspective A</p>
                          <h4 className="text-2xl font-black uppercase tracking-tighter">The Mist Zone</h4>
                       </div>
                    </div>
                    <div className="relative h-[500px] rounded-[3.5rem] overflow-hidden group shadow-2xl md:translate-y-16">
                       <SafeImage src="https://images.unsplash.com/photo-1542332213-31f87348057f" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D3E] via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-10 left-10 text-white">
                          <p className="text-[#F5A623] text-[0.6rem] font-black uppercase tracking-widest mb-2">Perspective B</p>
                          <h4 className="text-2xl font-black uppercase tracking-tighter">Golden Hour Peaks</h4>
                       </div>
                    </div>
                  </div>
               </div>
            </section>

            <section className="py-40 bg-[#0F3D3E] text-white overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 md:px-12">
                  <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
                     <div className="max-w-2xl">
                        <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.5em] mb-6 block">Year-Round Mastery</span>
                        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">A Different <br/><span className="text-[#F5A623]">Phenomenon</span> Every Season.</h2>
                     </div>
                     <p className="text-white/40 max-sm:max-w-full max-w-sm text-lg font-medium leading-relaxed mb-4">
                        From the cathedral of ice in winter to the lush mist-rainbows of summer, there is no "off-season" for the falls.
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                     {[
                       { season: "Spring", title: "The Great Thaw", desc: "Experience peak water volume as the winter ice breaks, creating thunderous vibrations felt miles away.", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef" },
                       { season: "Summer", title: "Rainbow mist", desc: "Long golden hours and clear blue skies create perfect prisms in the mist. Our most popular season.", img: "https://images.unsplash.com/photo-1510250672051-5b7d94f28585" },
                       { season: "Autumn", title: "Terroir & Falls", desc: "The surrounding vineyards turn crimson. Perfect for our Sommelier-led culinary expeditions.", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3" },
                       { season: "Winter", title: "Crystal Palace", desc: "The landscape freezes into intricate sculptures. VIP access to the Festival of Lights is included.", img: "https://images.unsplash.com/photo-1516934024742-b461fba47600" }
                     ].map((s, i) => (
                       <div key={i} className="group relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 p-8 hover:bg-[#F5A623] transition-all duration-500 cursor-default">
                          <div className="mb-8 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black text-white group-hover:bg-white group-hover:text-[#F5A623] transition-colors">{i+1}</div>
                          <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-[#0F3D3E] transition-colors">{s.season}</h4>
                          <p className="text-white/40 text-sm leading-relaxed font-medium group-hover:text-[#0F3D3E]/70 transition-colors">
                             {s.desc}
                          </p>
                          <div className="mt-10 h-[1px] w-full bg-white/10 group-hover:bg-[#0F3D3E]/20 transition-colors" />
                          <p className="mt-6 text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623] group-hover:text-[#0F3D3E] transition-colors">{s.title}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </section>

            <section className="py-32 bg-white">
               <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  <div className="relative rounded-[4rem] overflow-hidden h-[600px] shadow-2xl">
                     <SafeImage src="https://images.unsplash.com/photo-1549413240-3b9560376d54" className="w-full h-full object-cover" />
                     <div className="absolute top-10 left-10 bg-[#0F3D3E] text-white px-6 py-3 rounded-2xl flex items-center gap-3">
                        <Award className="text-[#F5A623]" size={20} />
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest">Premium Executive Fleet</span>
                     </div>
                  </div>
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.5em] mb-4 block">Uncompromising Logistics</span>
                        <h2 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">The Luxury <br/>Executive Standard.</h2>
                        <p className="text-stone-500 text-lg leading-relaxed font-medium">
                          Banish the thought of cramped tourist buses. We operate a fleet of bespoke executive vehicles featuring climate-controlled cabins, leather seating, and onboard refreshments.
                        </p>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="flex gap-6 items-start">
                           <div className="p-4 bg-stone-50 rounded-2xl text-[#F5A623]"><MapPin size={24} /></div>
                           <div><h5 className="text-xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-1">Door-to-Door Concierge</h5><p className="text-stone-400 text-sm font-medium">Complimentary pickup from any Downtown Toronto hotel or residence.</p></div>
                        </div>
                        <div className="flex gap-6 items-start">
                           <div className="p-4 bg-stone-50 rounded-2xl text-[#F5A623]"><Users size={24} /></div>
                           <div><h5 className="text-xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-1">Private Group Specialist</h5><p className="text-stone-400 text-sm font-medium">Custom logistics for corporate retreats and private family reunions.</p></div>
                        </div>
                        <div className="flex gap-6 items-start">
                           <div className="p-4 bg-stone-50 rounded-2xl text-[#F5A623]"><Compass size={24} /></div>
                           <div><h5 className="text-xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-1">Satellite Enabled Guides</h5><p className="text-stone-400 text-sm font-medium">Real-time traffic and crowd monitoring to ensure you beat the rush.</p></div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
            
            <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                <div>
                  <span className="text-[#F5A623] text-[0.7rem] font-black uppercase tracking-[0.5em] mb-4 block">Hand-Selected Itineraries</span>
                  <h2 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Signature Journeys</h2>
                </div>
                <button onClick={() => setView('tours')} className="flex items-center gap-4 text-[#0F3D3E] font-black uppercase text-[0.7rem] tracking-[0.2em] group">
                  View Full Catalog 
                  <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-[#F5A623] group-hover:text-white transition-all"><ArrowRight size={18} /></div>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {tours.slice(0, 3).map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}
              </div>
            </section>
          </div>
        )}

        {view === 'tours' && (
          <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div>
                <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Seasonal Collections</span>
                <h1 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Expeditions</h1>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#0F3D3E] text-white shadow-lg' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredTours.length > 0 ? (
                filteredTours.map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)
              ) : (
                <div className="col-span-full py-32 text-center">
                  <p className="text-stone-400 font-bold uppercase tracking-widest">No expeditions found in this category.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {view === 'gallery' && (
          <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left animate-fade-in">
            <h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-20 leading-[0.8]">Visual <br/><span className="text-[#F5A623]">Journal.</span></h1>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[
                "https://images.unsplash.com/photo-1549413240-3b9560376d54",
                "https://images.unsplash.com/photo-1552600213-90d571871a2e",
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
                "https://images.unsplash.com/photo-1516934024742-b461fba47600",
                "https://images.unsplash.com/photo-1510250672051-5b7d94f28585",
                "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
                "https://images.unsplash.com/photo-1514525253344-99a4299966c2",
                "https://images.unsplash.com/photo-1563298723-dcfebaa392e3",
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
                "https://images.unsplash.com/photo-1542332213-31f87348057f"
              ].map((img, i) => (
                <div key={i} className="relative rounded-[2rem] overflow-hidden group">
                  <SafeImage src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/90 backdrop-blur-md p-4 rounded-full text-[#0F3D3E]"><ExternalLink size={24} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'reviews' && (
          <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left animate-fade-in">
             <div className="max-w-4xl">
              <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">World Class Feedback</span>
              <h1 className="text-7xl md:text-[9rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-24 leading-none">Guest <br/>Stories.</h1>
              
              <div className="space-y-24">
                {[
                  { name: "Julian Thorne", location: "London, UK", text: "The helicopter perspective was life-changing. Niagara Tours handled every detail with such grace—it felt like traveling with family who happen to be experts in history.", rating: 5 },
                  { name: "Elena Rossi", location: "Milan, IT", text: "Absolutely stunning. The Sommelier's Route is a must for anyone who appreciates the finer points of viticulture. The small group size made all the difference.", rating: 5 },
                  { name: "Marcus Chen", location: "Singapore", text: "Professional, punctual, and profoundly educational. This isn't a tour; it's an education in nature's raw power. Highly recommend the Sunset Illumination.", rating: 5 }
                ].map((rev, i) => (
                  <div key={i} className="border-l-8 border-[#F5A623] pl-12 space-y-6">
                    <div className="flex gap-1">
                      {[...Array(rev.rating)].map((_, j) => <Star key={j} size={16} fill="#F5A623" className="text-[#F5A623]" />)}
                    </div>
                    <p className="text-3xl md:text-5xl font-medium text-[#0F3D3E] leading-tight tracking-tight italic">"{rev.text}"</p>
                    <div>
                      <p className="text-xl font-black text-[#0F3D3E] uppercase">{rev.name}</p>
                      <p className="text-stone-400 font-bold uppercase text-[0.6rem] tracking-widest">{rev.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === 'detail' && selectedTour && (
          <section className="animate-fade-in text-left">
            <div className="relative h-[75vh] w-full">
              <SafeImage src={selectedTour.image} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl mx-auto px-6 md:px-12 w-full pb-20">
                  <button onClick={() => setView('tours')} className="text-white/60 hover:text-white text-[0.65rem] font-bold uppercase tracking-widest mb-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"><ArrowRight size={16} className="rotate-180" /></div> Back to Catalog
                  </button>
                  <span className="bg-[#F5A623] text-[#0F3D3E] px-5 py-2 rounded-full text-[0.6rem] font-bold uppercase tracking-widest mb-8 inline-block shadow-xl">{selectedTour.category} Expedition</span>
                  <h1 className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">{selectedTour.name}</h1>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 grid grid-cols-1 lg:grid-cols-3 gap-24">
              <div className="lg:col-span-2 space-y-20">
                <div>
                  <h3 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-stone-300 mb-8">The Experience</h3>
                  <p className="text-3xl md:text-4xl font-medium text-[#0F3D3E] leading-relaxed italic border-l-[12px] border-[#F5A623] pl-12">{selectedTour.description}</p>
                </div>
                
                <div>
                  <h3 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-stone-300 mb-10">Expedition Itinerary</h3>
                  <div className="space-y-12">
                    {selectedTour.itinerary?.map((item, idx) => (
                      <div key={idx} className="flex gap-8 items-start group">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-3xl bg-stone-100 flex items-center justify-center text-[0.8rem] font-black text-[#0F3D3E] shrink-0 border border-stone-200 transition-colors group-hover:bg-[#F5A623] group-hover:text-white group-hover:border-[#F5A623]">0{idx + 1}</div>
                          {idx < selectedTour.itinerary.length - 1 && <div className="absolute top-14 left-1/2 w-[2px] h-10 bg-stone-100 -translate-x-1/2" />}
                        </div>
                        <p className="text-2xl font-bold text-[#0F3D3E] pt-2">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-stone-100 sticky top-40">
                  <div className="mb-10 pb-10 border-b border-stone-100 space-y-6">
                    <div className="flex justify-between items-end">
                      <p className="text-stone-400 text-[0.65rem] font-bold uppercase tracking-widest">Pricing</p>
                      <p className="text-5xl font-black text-[#0F3D3E] tracking-tighter">${selectedTour.price} <span className="text-sm font-normal opacity-40 uppercase tracking-widest">/ pp</span></p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-stone-400 text-[0.65rem] font-bold uppercase tracking-widest">Duration</p>
                      <p className="text-2xl font-black text-[#0F3D3E]">{selectedTour.duration}</p>
                    </div>
                  </div>
                  <div className="space-y-5 mb-12">
                    <div className="flex items-center gap-4 text-stone-600 font-bold text-sm uppercase tracking-tight"><ShieldCheck size={20} className="text-[#F5A623]" /> Certified Guide</div>
                    <div className="flex items-center gap-4 text-stone-600 font-bold text-sm uppercase tracking-tight"><CreditCard size={20} className="text-[#F5A623]" /> All Entry Fees Incl.</div>
                    <div className="flex items-center gap-4 text-stone-600 font-bold text-sm uppercase tracking-tight"><Calendar size={20} className="text-[#F5A623]" /> 48h Flexible Window</div>
                  </div>
                  <button onClick={() => { setView('booking'); window.scrollTo(0,0); }} className="w-full bg-[#0F3D3E] text-white py-7 rounded-3xl font-black uppercase text-[0.75rem] tracking-[0.2em] shadow-2xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-2">Request Reservation</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'about' && (
          <section className="pt-48 pb-32 px-6 md:px-12 max-w-4xl mx-auto text-left animate-fade-in">
            <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Founded 1994</span>
            <h1 className="text-8xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-16 leading-[0.8]">Our <br/><span className="text-[#F5A623]">Heritage.</span></h1>
            <div className="space-y-16 text-2xl text-stone-500 leading-relaxed font-medium">
              <p className="text-4xl text-[#0F3D3E] font-bold leading-tight mb-20 border-l-[12px] border-[#F5A623] pl-12">Niagara Tours was born from a simple realization: the world's most powerful natural wonder deserved a sophisticated audience.</p>
              <p>We began with a single executive coach and a vision to replace the typical "tourist bus" with a storytelling expedition. Today, we are proud to be Toronto's premier luxury operator, serving over 5,000 guests annually with bespoke itineraries.</p>
              
              <div className="grid grid-cols-2 gap-12 py-16 border-y border-stone-100">
                <div><p className="text-6xl font-black text-[#F5A623] tracking-tighter">32</p><p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-stone-400">Years of Service</p></div>
                <div><p className="text-6xl font-black text-[#F5A623] tracking-tighter">12</p><p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-stone-400">Bespoke Routes</p></div>
              </div>
              
              <p>Our commitment remains unchanged: strictly small groups, handpicked culinary partners, and guides who treat every guest like an honored member of our family. We don't just show you the falls; we help you experience their true magnitude.</p>
            </div>
          </section>
        )}

        {view === 'contact' && (
          <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left animate-fade-in">
            <h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-24 leading-none">Concierge.</h1>
            <div className="grid lg:grid-cols-2 gap-32">
              <div className="space-y-16">
                <div className="flex items-center gap-10 group cursor-pointer">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Phone size={40} /></div>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Direct Line</p>
                    <p className="text-4xl font-black text-[#0F3D3E] tracking-tight group-hover:text-[#F5A623] transition-colors">+1 416-555-0199</p>
                  </div>
                </div>
                <div className="flex items-center gap-10 group cursor-pointer">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Mail size={40} /></div>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Inquiry</p>
                    <p className="text-4xl font-black text-[#0F3D3E] tracking-tight group-hover:text-[#F5A623] transition-colors">hello@niagaratours.ca</p>
                  </div>
                </div>
                <div className="pt-16 border-t border-stone-100">
                  <p className="text-stone-400 font-medium text-xl leading-relaxed">Our concierge desk is available 24/7 for premium members and from 8AM to 8PM EST for general inquiries.</p>
                  <div className="flex gap-6 mt-10">
                    {[Instagram, Facebook, Twitter].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 rounded-2xl border border-stone-100 flex items-center justify-center text-[#0F3D3E] hover:bg-[#F5A623] hover:text-white transition-all"><Icon size={20} /></button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-stone-100">
                <h3 className="text-4xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter leading-none">Direct Dispatch</h3>
                <form className="space-y-6" onSubmit={e => { e.preventDefault(); setView('success'); window.scrollTo(0,0); }}>
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Full Name</label>
                    <input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Julian Thorne" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Email Address</label>
                    <input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="j.thorne@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Message</label>
                    <textarea required rows="4" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Tell us about your requirements..."></textarea>
                  </div>
                  <button className="w-full bg-[#0F3D3E] text-white py-7 rounded-3xl font-black uppercase tracking-[0.2em] text-[0.7rem] shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-2">Send Dispatch</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {view === 'booking' && (
          <section className="pt-48 pb-32 px-6">
            <div className="max-w-2xl mx-auto bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-stone-100 animate-fade-in text-left">
              <div className="mb-14">
                <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Reservation Request</span>
                <h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-[0.9]">{selectedTour?.name}</h2>
              </div>
              
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.target);
                handleBooking(Object.fromEntries(formData)); 
              }} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Guest Name</label>
                  <input name="name" required className="w-full bg-[#FDFDF9] p-6 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" placeholder="Alexander Knight" />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Contact Email</label>
                  <input name="email" required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" placeholder="alex@knight.com" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Date</label>
                    <input name="date" required type="date" className="w-full bg-[#FDFDF9] p-6 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-stone-400 ml-4">Guests</label>
                    <select name="guests" className="w-full bg-[#FDFDF9] p-6 rounded-2xl border border-stone-100 focus:border-[#F5A623] outline-none transition-all appearance-none">
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Traveler{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-8">
                  <button disabled={isSubmitting} type="submit" className="w-full bg-[#0F3D3E] text-white py-7 rounded-3xl font-black uppercase tracking-widest hover:bg-[#F5A623] transition-all shadow-xl disabled:opacity-50">
                    {isSubmitting ? 'Processing...' : 'Secure Expedition'}
                  </button>
                  <button type="button" onClick={() => setView('tours')} className="w-full text-stone-400 font-bold uppercase tracking-[0.3em] text-[0.6rem] mt-8 hover:text-red-500 transition-colors">Abandon Request</button>
                </div>
              </form>
            </div>
          </section>
        )}

        {view === 'success' && (
          <section className="py-72 text-center animate-fade-in px-10">
            <div className="w-32 h-32 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-16 shadow-2xl shadow-[#F5A623]/40">
              <CheckCircle className="text-white" size={72} />
            </div>
            <h2 className="text-8xl md:text-[12rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-12">Secured.</h2>
            <p className="text-3xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">Your request is being processed by our concierge desk. You will receive a secure boarding pass via email within 15 minutes.</p>
            <button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="mt-24 bg-[#0F3D3E] text-white px-24 py-10 rounded-3xl font-black uppercase transition-all hover:bg-[#F5A623] shadow-2xl tracking-[0.4em] text-base">Return to Overview</button>
          </section>
        )}
      </main>

      <footer className="bg-[#0F3D3E] text-white pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 text-left mb-32 border-b border-white/10 pb-32">
            <div className="col-span-1 md:col-span-1">
              <Logo light />
              <p className="mt-10 text-white/40 text-sm leading-relaxed max-w-xs font-medium">Providing discerning travelers with bespoke access to North America's most powerful natural wonders since 1994.</p>
              <div className="flex gap-4 mt-10">
                 {[Instagram, Facebook, Twitter].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#F5A623] hover:text-white transition-all"><Icon size={16} /></button>
                 ))}
              </div>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-12">Expeditions</h4>
              <ul className="space-y-5 text-sm text-white/40 font-bold uppercase tracking-widest">
                {tours.slice(0, 5).map(t => (
                  <li key={t.id} onClick={() => { setSelectedTour(t); setView('detail'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors line-clamp-1">{t.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-12">Quick Access</h4>
              <ul className="space-y-5 text-sm text-white/40 font-bold uppercase tracking-widest">
                <li onClick={() => setView('gallery')} className="hover:text-white cursor-pointer transition-colors">Visual Journal</li>
                <li onClick={() => setView('about')} className="hover:text-white cursor-pointer transition-colors">Our Legacy</li>
                <li onClick={() => setView('reviews')} className="hover:text-white cursor-pointer transition-colors">Guest Stories</li>
                <li onClick={() => setView('contact')} className="hover:text-white cursor-pointer transition-colors">Concierge Desk</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-12">Intelligence</h4>
              <p className="text-white/40 text-xs mb-10 leading-relaxed font-medium uppercase tracking-widest">Receive seasonal alerts and curated itinerary updates.</p>
              <div className="flex flex-col gap-4">
                <input className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-[#F5A623] transition-all" placeholder="Dispatch Address" />
                <button className="bg-[#F5A623] text-[#0F3D3E] py-5 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.3em] shadow-xl">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.6em] text-white/20">© 2026 Niagara Tours Canada • Toronto Headquarters</p>
            <div className="flex gap-12 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-white/20">
              <span className="hover:text-white/60 cursor-pointer">Privacy</span>
              <span className="hover:text-white/60 cursor-pointer">Protocol</span>
              <span className="hover:text-white/60 cursor-pointer">Liability</span>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
        
        @keyframes slow-zoom { from { transform: scale(1.0); } to { transform: scale(1.1); } }
        .animate-slow-zoom { animation: slow-zoom 20s linear infinite alternate; }

        body { scroll-behavior: smooth; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #FDFDF9; }
        ::-webkit-scrollbar-thumb { background: #0F3D3E; border-radius: 10px; }
      `}} />
    </div>
  );
}