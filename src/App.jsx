import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  Clock, Menu, X, Users, Star, Compass, 
  Image as ImageIcon, ChevronDown, MapPin, 
  ArrowRight, ShieldCheck, Waves, Instagram, 
  Facebook, Twitter, Mail, Phone, CheckCircle,
  Calendar, CreditCard, Camera, Leaf, Play,
  Coffee, Wine, Map, Sparkles, Utensils, Info,
  Plus, HelpCircle
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
  return <img src={cleanSrc} alt={alt} className={className} style={style} onError={() => setError(true)} />;
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
    { id: 'tours', label: 'Expeditions' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'Heritage' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Concierge' }
  ];
  const handleNav = (id) => {
    if (['gallery', 'reviews'].includes(id)) return;
    setView(id);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };
  return (
    <header className="fixed top-0 left-0 w-full bg-[#0F3D3E] border-b border-white/5 z-[100]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
        <button onClick={() => handleNav('home')} className="hover:opacity-80 transition-opacity"><Logo light={true} /></button>
        <div className="hidden xl:flex items-center gap-10">
          {links.map(link => (
            <button key={link.id} onClick={() => handleNav(link.id)} className={`text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all relative group py-2 ${activeView === link.id ? 'text-[#F5A623]' : 'text-white/70 hover:text-white'}`}>
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F5A623] transition-all ${activeView === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
        </div>
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
          <button onClick={() => handleNav('tours')} className="w-full bg-[#F5A623] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Reserve Expedition</button>
        </div>
      )}
    </header>
  );
};

const TourCard = ({ tour, onSelect }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group flex flex-col h-full border border-stone-100/50 text-left">
    <div className="h-80 relative overflow-hidden">
      <SafeImage src={tour.image} alt={tour.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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
      <button onClick={() => onSelect(tour)} className="w-full bg-[#0F3D3E] text-white py-4 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-[#F5A623] transition-all">View Expedition</button>
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
  const [selectedTour, setSelectedTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const toursCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tours');
    return onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { 
            name: "The Grand Estate", 
            price: 129, 
            category: "Heritage", 
            capacity: 48, 
            duration: "9 Hours", 
            description: "A flagship full-day journey through the heart of the Niagara peninsula. This tour blends the raw power of the falls with the sophisticated charm of historic Niagara-on-the-Lake and its world-class estates.", 
            highlights: ["Heritage Town Exploration", "Elite Vineyard Access", "Horseshoe Falls Observation", "Luxury Transportation"],
            included: ["Certified Professional Guide", "3-Course Winery Lunch", "Behind the Falls Admission", "Bottled Artesian Water"],
            itinerary: [
              { time: "08:30 AM", event: "Departure from Downtown Toronto", desc: "Board our executive class coach for a scenic drive along the lake." },
              { time: "10:30 AM", event: "Niagara-on-the-Lake Discovery", desc: "Walking tour of the 19th-century Victorian town." },
              { time: "12:30 PM", event: "Gourmet Vineyard Luncheon", desc: "Seated lunch overlooking the grapevines." },
              { time: "02:30 PM", event: "The Falls Experience", desc: "Extended time at the brink of the Horseshoe Falls." },
              { time: "04:30 PM", event: "Behind the Falls Journey", desc: "Descend into the bedrock tunnels for a primal view." }
            ],
            faqs: [
              { q: "What should I wear?", a: "Comfortable walking shoes and layers. We provide ponchos for the wet sections." },
              { q: "Is lunch included?", a: "Yes, a full 3-course gourmet lunch at a partner winery is included." }
            ],
            image: "/tour-1.jpg" 
          },
          { 
            name: "Sunset Illumination", 
            price: 159, 
            category: "Culinary", 
            capacity: 24, 
            duration: "6 Hours", 
            description: "Witness the transition of the falls from daylight to a technicolor light show. This evening expedition is designed for the senses, featuring fine dining and twilight vistas.", 
            highlights: ["Night-Sky Falls Viewing", "Technicolor Light Show", "Golden Hour Photography", "Five-Star Dining"],
            included: ["Fallsview Gourmet Dinner", "Illumination Power Tower Access", "Luxury Chauffeur", "VIP Scenic Platform"],
            itinerary: [
              { time: "03:00 PM", event: "Afternoon Departure", desc: "Late day pickup to catch the golden hour transition." },
              { time: "05:00 PM", event: "Table Rock Golden Hour", desc: "Perfect light for premium photography of the rapids." },
              { time: "06:30 PM", event: "Exclusive Fallsview Dinner", desc: "3-course gourmet dining with unobstructed falls views." },
              { time: "08:30 PM", event: "The Illumination Show", desc: "Watch the falls ignite with millions of lumens of light." }
            ],
            faqs: [
              { q: "Can we see the fireworks?", a: "Yes, our schedule is coordinated with the nightly fireworks display schedule." },
              { q: "Is there a dress code for dinner?", a: "Smart casual is recommended for the Fallsview restaurant." }
            ],
            image: "/tour-2.jpg" 
          },
          { 
            name: "Aerial Majesty", 
            price: 499, 
            category: "Luxury", 
            capacity: 4, 
            duration: "2 Hours", 
            description: "The ultimate perspective on North America's most powerful water feature. Experience a private helicopter excursion spanning from Lake Ontario to the Whirlpool Rapids.", 
            highlights: ["Private Flight Path", "Champagne Welcome", "Unobstructed Rapids View", "Lake-to-Falls Traversal"],
            included: ["Private Helicopter Charter", "Premium Glass-Roof Vehicle", "Sparkling Wine Toast", "Personal Concierge"],
            itinerary: [
              { time: "10:00 AM", event: "Executive Car Pickup", desc: "Private luxury sedan arrival at your doorstep." },
              { time: "10:45 AM", event: "Helipad Boarding", desc: "Pre-flight briefing and champagne reception." },
              { time: "11:00 AM", event: "The Grand Flight", desc: "45 minutes of low-altitude falls-view flying." },
              { time: "11:45 AM", event: "Post-Flight Lounge", desc: "Curated snacks and viewing of flight footage." }
            ],
            faqs: [
              { q: "What is the weight limit?", a: "For safety, the maximum per-passenger weight is 250 lbs." },
              { q: "Is motion sickness common?", a: "Our flight paths are chosen for maximum stability, but we recommend non-drowsy medication if sensitive." }
            ],
            image: "/tour-3.jpg" 
          },
          { 
            name: "Winter Wonderland", 
            price: 149, 
            category: "Seasonal", 
            capacity: 12, 
            duration: "7 Hours", 
            description: "A specialized winter expedition to witness the Falls transformed into a cathedral of ice. Warmth and luxury guide you through the frozen majesty.", 
            highlights: ["Frozen Falls Observation", "Festival of Lights Access", "Winter Winery Experience", "Ice-Bridge Vistas"],
            included: ["Heated Luxury Shuttle", "Warm Onboard Refreshments", "Icewine Tasting Session", "Premium Parkas Provided"],
            itinerary: [
              { time: "11:00 AM", event: "Late Morning Pickup", desc: "Start the day with warm blankets and hot cider." },
              { time: "01:00 PM", event: "The Frozen Crest", desc: "Witness the massive icicles forming at the brink." },
              { time: "02:30 PM", event: "Icewine Masterclass", desc: "Specialized tasting of the region's winter gold." },
              { time: "04:30 PM", event: "Winter Festival of Lights", desc: "Driving tour through millions of holiday lights." }
            ],
            faqs: [
              { q: "How cold will it be?", a: "Temperatures can drop to -15°C, but our vehicles and viewing platforms are climate-controlled." },
              { q: "Are tours cancelled for snow?", a: "We operate in all conditions unless road safety is compromised." }
            ],
            image: "/tour-4.jpg" 
          },
          { 
            name: "Adventure Expedition", 
            price: 189, 
            category: "Adventure", 
            capacity: 20, 
            duration: "5 Hours", 
            description: "For those who want to feel the mist. This fast-paced tour focuses on the sheer kinetic energy of the rapids and the thunderous base of the falls.", 
            highlights: ["Hornblower VIP Entry", "Whirlpool Aero Car", "Cave of the Winds Walk", "Power-Generation Station"],
            included: ["Priority Attraction Pass", "Professional Action Guide", "Waterproof Gear", "Energy Refreshment Pack"],
            itinerary: [
              { time: "09:00 AM", event: "Express Commute", desc: "Direct route to the heart of the adventure zone." },
              { time: "10:30 AM", event: "Hornblower Voyage", desc: "VIP boarding to get to the base of the falls." },
              { time: "11:45 AM", event: "Cave of the Winds", desc: "Walking tour under the Bridal Veil falls." },
              { time: "01:00 PM", event: "Whirlpool Rapids", desc: "High-angle observation of the class 6 rapids." }
            ],
            faqs: [
              { q: "Will I get wet?", a: "Yes, absolutely. We provide heavy-duty recycling-friendly ponchos and sandals." },
              { q: "Is it safe for children?", a: "Recommended for children 6 and up due to the intensity of the mist and spray." }
            ],
            image: "/tour-5.jpg" 
          },
          { 
            name: "Sommelier's Route", 
            price: 249, 
            category: "Culinary", 
            capacity: 8, 
            duration: "8 Hours", 
            description: "A deep dive into the region's unique terroir. Visit four boutique estates for private tastings led by an expert Sommelier.", 
            highlights: ["Cellar Master Access", "Rare Vintage Samples", "Master Sommelier Guide", "Organic Terroir Focus"],
            included: ["Private Estate Clearances", "Farm-to-Table Tasting Menu", "Luxury Transport", "Estate-Stored Souvenir"],
            itinerary: [
              { time: "09:30 AM", event: "Departure", desc: "Morning pickup in a luxury executive van." },
              { time: "11:00 AM", event: "First Growth Tasting", desc: "Exclusive access to the library wine room." },
              { time: "01:00 PM", event: "Chef's Garden Lunch", desc: "Al fresco dining featuring local seasonal produce." },
              { time: "03:00 PM", event: "Terroir Walking Tour", desc: "Walk the vines with a head horticulturalist." }
            ],
            faqs: [
              { q: "Can we purchase wine to ship?", a: "Yes, we handle international shipping logistics from all partner estates." },
              { q: "Is the Sommelier present all day?", a: "Yes, you are guided by a level 3 Sommelier throughout the experience." }
            ],
            image: "/tour-6.jpg" 
          },
          { 
            name: "The Midnight Gala", 
            price: 799, 
            category: "Private", 
            capacity: 4, 
            duration: "4 Hours", 
            description: "The peak of exclusivity. A private midnight limousine journey to a reserved balcony for the fireworks display.", 
            highlights: ["Midnight Limousine", "Private Fireworks Balcony", "Vintage Champagne Service", "Exclusive Access"],
            included: ["Stretch Limo Service", "Bottle of Krug Champagne", "Private Security Escort", "Gourmet Caviar Selection"],
            itinerary: [
              { time: "09:00 PM", event: "Limo Arrival", desc: "Pickup in a fully stocked stretch limousine." },
              { time: "10:30 PM", event: "Balcony Reception", desc: "Arrival at a private rooftop overlooking the falls." },
              { time: "11:00 PM", event: "The Grand Fireworks", desc: "Front-row seats to the spectacular show." },
              { time: "12:00 AM", event: "Midnight Return", desc: "Chauffeur service back to your city location." }
            ],
            faqs: [
              { q: "Can we customize the music?", a: "Yes, the limousine audio system is at your complete disposal." },
              { q: "Is this tour weather dependent?", a: "The fireworks may be delayed, but the balcony dining and limo service proceed regardless." }
            ],
            image: "/tour-7.jpg" 
          },
          { 
            name: "Historic Forts Tour", 
            price: 119, 
            category: "Heritage", 
            capacity: 32, 
            duration: "7 Hours", 
            description: "Step back into 1812. A focused historical expedition through the military installations that shaped the border.", 
            highlights: ["Old Fort Erie Entry", "Musket Demonstrations", "Officer's Mess Dining", "Border History Focus"],
            included: ["Museum Access Passes", "Historical Reenactor Guide", "Period-Authentic Lunch", "Heritage Transit"],
            itinerary: [
              { time: "08:30 AM", event: "Muster and Departure", desc: "Gather for the historical briefing and departure." },
              { time: "10:00 AM", event: "Old Fort Erie Siege", desc: "Guided tour of Canada's bloodiest battlefield." },
              { time: "12:30 PM", event: "Heritage Luncheon", desc: "Traditional dining experience at the fort." },
              { time: "02:00 PM", event: "Fort George Cannonry", desc: "Watch the firing of period-accurate cannons." }
            ],
            faqs: [
              { q: "Are there loud noises?", a: "Yes, musket and cannon demonstrations can be loud; ear protection is provided." },
              { q: "How much walking is involved?", a: "About 2 miles total on grass and gravel paths." }
            ],
            image: "/tour-8.jpg" 
          },
          { 
            name: "Nature's Sanctuary", 
            price: 139, 
            category: "Eco", 
            capacity: 14, 
            duration: "6 Hours", 
            description: "Discover the lush ecosystem of the Niagara Glen. A slow-paced tour focused on botany, butterflies, and tranquility.", 
            highlights: ["Butterfly Conservatory", "Botanical Garden Tour", "Niagara Glen Hike", "Eco-System Deep Dive"],
            included: ["Botanist Expert Guide", "Organic Picnic Basket", "Conservatory Admission", "Low-Emission Transport"],
            itinerary: [
              { time: "09:00 AM", event: "Eco-Pickup", desc: "Commute in our low-emission luxury hybrid." },
              { time: "10:30 AM", event: "Butterfly Flight", desc: "Walking through thousands of tropical butterflies." },
              { time: "12:00 PM", event: "Glen Nature Hike", desc: "Intermediate hike through ancient rock formations." },
              { time: "02:00 PM", event: "Botanical Picnic", desc: "Gourmet organic lunch in the rose garden." }
            ],
            faqs: [
              { q: "Is the hike difficult?", a: "It is rated as moderate difficulty with some uneven stone steps." },
              { q: "What should I bring?", a: "Reusable water bottle and a sun hat are highly recommended." }
            ],
            image: "/tour-9.jpg" 
          },
          { 
            name: "Photographer's Lens", 
            price: 299, 
            category: "Luxury", 
            capacity: 6, 
            duration: "5 Hours", 
            description: "Capture the falls with professional equipment and guidance. This tour grants access to restricted vantage points.", 
            highlights: ["Restricted Point Access", "Long Exposure Training", "Aerial Drone Vistas", "Expert Light Coaching"],
            included: ["Pro Equipment Rental", "Private Vantage Clearances", "Professional Editor Guide", "High-Speed Transit"],
            itinerary: [
              { time: "03:30 PM", event: "Equipment Briefing", desc: "Review the gear and plan the evening shoot." },
              { time: "05:00 PM", event: "Restricted Vantage #1", desc: "Golden hour shoot from a non-public cliff edge." },
              { time: "06:30 PM", event: "The Blue Hour", desc: "Capturing the mist and motion during dusk." },
              { time: "08:00 PM", event: "Night Exposure", desc: "Mastering the shots of the illuminated falls." }
            ],
            faqs: [
              { q: "Can I bring my own gear?", a: "Absolutely. Our expert can help you optimize your personal settings." },
              { q: "Is drone flying permitted?", a: "Only under our pilot's supervision in authorized flight zones." }
            ],
            image: "/tour-10.jpg" 
          }
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
      await addDoc(bookingsRef, { ...data, tourId: selectedTour?.id, tourName: selectedTour?.name, userId: user.uid, createdAt: serverTimestamp() });
      setView('success');
      window.scrollTo(0,0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex flex-col font-sans selection:bg-[#F5A623]/30 pt-[100px] text-left">
      <Nav setView={setView} activeView={view} />
      <main className="flex-grow">
        {/* HOME VIEW */}
        {view === 'home' && (
          <>
            <section className="relative w-full overflow-hidden bg-black">
              <div className="relative h-[85vh] w-full">
                <SafeImage src="/hero.jpg" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }} />
                <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center animate-slide-up">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="max-w-4xl pt-10">
                      <h1 className="text-white font-black text-6xl md:text-[9.5rem] uppercase leading-[0.8] tracking-tighter mb-10">Primal <br/><span className="text-[#F5A623]">Energy.</span></h1>
                      <p className="text-white/90 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mb-12">The Horseshoe Falls alone drops <span className="text-[#F5A623] font-bold">600,000 gallons</span> of water every second. We take you closer than anyone else.</p>
                      <div className="flex flex-wrap gap-6">
                        <button onClick={() => setView('tours')} className="bg-[#F5A623] text-black px-12 py-5 rounded-xl font-black uppercase text-[0.8rem] tracking-[0.2em] shadow-2xl hover:bg-white transition-all">Book Expedition</button>
                        <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-xl font-black uppercase text-[0.8rem] tracking-[0.2em] hover:bg-white/20 transition-all flex items-center gap-3"><Play size={18} fill="currentColor" /> Visual Proof</button>
                      </div>
                    </div>
                    <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 max-w-md transform xl:-translate-y-24 shadow-2xl transition-transform">
                      <div className="flex items-center gap-3 text-[#F5A623] mb-6"><Waves size={24} /><span className="font-black uppercase tracking-widest text-sm">The Hydropower Legacy</span></div>
                      <p className="text-white/70 text-sm leading-relaxed mb-8">Since the late 19th century, the falls have powered the eastern seaboard. Our heritage tours include exclusive access to historic power stations.</p>
                      <div className="grid grid-cols-2 gap-8">
                        <div><p className="text-3xl font-black text-white tracking-tighter">4.9M</p><p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/40">Kilowatts Daily</p></div>
                        <div><p className="text-3xl font-black text-white tracking-tighter">1881</p><p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/40">First Power Plant</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 right-12 text-right hidden xl:block text-white/60">
                  <div className="mb-6"><p className="text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623]">Location</p><p className="text-xs font-bold font-mono text-white">43.0896° N, 79.0849° W</p></div>
                  <div><p className="text-[0.6rem] font-black uppercase tracking-widest text-[#F5A623]">Flow Speed</p><p className="text-xs font-bold font-mono uppercase text-white">65 KM / HOUR (PEAK)</p></div>
                </div>
              </div>
            </section>
            <section className="py-32 px-6 md:px-12 max-w-[1440px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="text-left"><span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Hand-Selected Itineraries</span><h2 className="text-5xl font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">Signature Journeys</h2></div>
                <button onClick={() => setView('tours')} className="flex items-center gap-2 text-[#0F3D3E] font-bold uppercase text-[0.65rem] tracking-widest group">View Full Catalog <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {tours.slice(0, 6).map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}
              </div>
            </section>
          </>
        )}
        {view === 'tours' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto animate-fade-in">
            <span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Seasonal Collections</span>
            <h1 className="text-6xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-20 leading-none">The 10 Expeditions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">{tours.map(t => <TourCard key={t.id} tour={t} onSelect={(tour) => { setSelectedTour(tour); setView('detail'); window.scrollTo(0,0); }} />)}</div>
          </section>
        )}
        {view === 'detail' && selectedTour && (
          <section className="animate-fade-in pb-32">
            <div className="relative h-[70vh] w-full bg-black">
              <SafeImage src={selectedTour.image} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
              <div className="absolute inset-0 flex items-end"><div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full pb-20"><button onClick={() => setView('tours')} className="text-white/60 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest mb-8 flex items-center gap-2"><ArrowRight size={14} className="rotate-180" /> Back to Catalog</button><span className="bg-[#F5A623] text-[#0F3D3E] px-4 py-1.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest mb-6 inline-block">{selectedTour.category} Expedition</span><h1 className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">{selectedTour.name}</h1></div></div>
            </div>
            
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32 grid grid-cols-1 lg:grid-cols-3 gap-24">
              <div className="lg:col-span-2 space-y-24">
                <div className="space-y-12">
                   <div>
                     <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-6">The Experience</h3>
                     <p className="text-3xl md:text-4xl font-medium text-[#0F3D3E] leading-tight italic border-l-[12px] border-[#F5A623] pl-12">{selectedTour.description}</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                      {selectedTour.highlights?.map((h, i) => (
                        <div key={i} className="flex items-center gap-5 p-8 bg-white rounded-3xl border border-stone-100 shadow-sm">
                           <div className="w-12 h-12 rounded-2xl bg-[#0F3D3E] flex items-center justify-center text-[#F5A623] shrink-0"><Sparkles size={20} /></div>
                           <span className="text-lg font-black text-[#0F3D3E] uppercase tracking-tighter leading-none">{h}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                  <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-stone-400 mb-12 flex items-center gap-4">
                    <Clock size={20} className="text-[#F5A623]" /> Complete Expedition Itinerary
                  </h3>
                  <div className="space-y-12 pl-4 border-l-2 border-stone-100 ml-2">
                    {selectedTour.itinerary?.map((item, idx) => (
                      <div key={idx} className="relative pl-12 group">
                        <div className="absolute -left-[2.35rem] top-0 w-8 h-8 rounded-full bg-[#FDFDF9] border-2 border-stone-100 flex items-center justify-center text-[0.6rem] font-black text-[#F5A623] group-hover:border-[#F5A623] transition-colors">{idx + 1}</div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <span className="text-[0.7rem] font-black text-[#F5A623] uppercase tracking-widest">{item.time}</span>
                              <div className="h-px bg-stone-100 flex-grow" />
                           </div>
                           <h4 className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter">{item.event}</h4>
                           <p className="text-stone-500 text-lg leading-relaxed max-w-2xl">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-[3rem] p-12 md:p-16 border border-stone-100">
                   <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#0F3D3E] mb-10 flex items-center gap-3">
                      <ShieldCheck size={20} className="text-[#F5A623]" /> What's Included in Your Fare
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      {selectedTour.included?.map((inc, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <CheckCircle size={20} className="text-[#F5A623] shrink-0" />
                           <span className="text-lg font-bold text-[#0F3D3E]">{inc}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* FAQ SECTION */}
                <div>
                   <h3 className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-stone-400 mb-12 flex items-center gap-4">
                      <HelpCircle size={20} className="text-[#F5A623]" /> Expedition Knowledge Base
                   </h3>
                   <div className="space-y-4">
                      {selectedTour.faqs?.map((faq, i) => (
                        <div key={i} className="bg-white border border-stone-100 p-10 rounded-3xl shadow-sm">
                           <h4 className="text-xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-4 flex items-center gap-3">
                              <Plus size={18} className="text-[#F5A623]" /> {faq.q}
                           </h4>
                           <p className="text-stone-500 text-lg leading-relaxed pl-7">{faq.a}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-stone-100 sticky top-32">
                  <div className="mb-12 pb-12 border-b border-stone-100 space-y-6">
                    <div className="flex justify-between items-end"><p className="text-stone-400 text-[0.65rem] font-black uppercase tracking-widest">Premium Fare</p><p className="text-5xl font-black text-[#0F3D3E] tracking-tighter">${selectedTour.price} <span className="text-sm font-normal text-stone-400 uppercase tracking-widest">Per Guest</span></p></div>
                    <div className="flex justify-between items-end"><p className="text-stone-400 text-[0.65rem] font-black uppercase tracking-widest">Duration</p><p className="text-2xl font-black text-[#0F3D3E] uppercase tracking-tighter">{selectedTour.duration}</p></div>
                  </div>
                  <div className="space-y-6 mb-12">
                     <div className="flex items-center gap-4 text-stone-600 text-sm font-bold uppercase tracking-widest"><ShieldCheck size={20} className="text-[#F5A623]" /> Certified Master Guide</div>
                     <div className="flex items-center gap-4 text-stone-600 text-sm font-bold uppercase tracking-widest"><CreditCard size={20} className="text-[#F5A623]" /> Instant Boarding Confirmation</div>
                     <div className="flex items-center gap-4 text-stone-600 text-sm font-bold uppercase tracking-widest"><Calendar size={20} className="text-[#F5A623]" /> 48h Flexible Window</div>
                  </div>
                  <button onClick={() => { setView('booking'); window.scrollTo(0,0); }} className="w-full bg-[#0F3D3E] text-white py-8 rounded-[2rem] font-black uppercase text-[0.8rem] tracking-[0.2em] shadow-2xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Request Booking</button>
                  <p className="text-[0.6rem] text-center text-stone-400 mt-6 font-bold uppercase tracking-widest">No immediate payment required for review</p>
                </div>
              </div>
            </div>
          </section>
        )}
        {view === 'about' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-4xl mx-auto animate-fade-in"><span className="text-[#F5A623] text-[0.6rem] font-bold uppercase tracking-[0.4em] mb-4 block">Founded 1994</span><h1 className="text-7xl font-black text-[#0F3D3E] uppercase tracking-tighter mb-12 leading-none">Our Heritage.</h1><p className="text-3xl text-[#0F3D3E] font-bold leading-tight mb-16 border-l-[12px] border-[#F5A623] pl-12">Niagara Tours was born from a simple realization: the world's most powerful natural wonder deserved a sophisticated audience.</p><div className="space-y-12 text-2xl text-stone-500 leading-relaxed font-medium"><p>We began with a single executive coach and a vision to replace the typical "tourist bus" with a storytelling expedition. Today, we are proud to be Toronto's premier luxury operator.</p></div></section>
        )}
        {view === 'contact' && (
          <section className="pt-12 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto animate-fade-in"><h1 className="text-8xl md:text-[10rem] font-black text-[#0F3D3E] uppercase tracking-tighter mb-24 leading-none">Concierge.</h1><div className="grid lg:grid-cols-2 gap-32"><div className="space-y-16"><div className="flex items-center gap-10 group"><div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Phone size={40} /></div><div><p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Direct Line</p><p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">+1 416-555-0199</p></div></div><div className="flex items-center gap-10 group"><div className="w-24 h-24 rounded-[2.5rem] bg-stone-100 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-white transition-all shadow-sm"><Mail size={40} /></div><div><p className="text-[0.7rem] font-bold uppercase tracking-widest text-stone-400 mb-2">Email Inquiry</p><p className="text-4xl font-black text-[#0F3D3E] tracking-tight hover:text-[#F5A623] cursor-pointer transition-colors">hello@niagaratours.ca</p></div></div></div><div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-stone-100"><h3 className="text-3xl font-black text-[#0F3D3E] uppercase mb-12 tracking-tighter">Direct Dispatch</h3><form className="space-y-6" onSubmit={e => { e.preventDefault(); setView('success'); window.scrollTo(0,0); }}><input required className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Your Name" /><input required type="email" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="Email Address" /><textarea required rows="4" className="w-full bg-[#FDFDF9] p-6 rounded-2xl outline-none focus:border-[#F5A623] border border-stone-100 transition-all shadow-sm" placeholder="How can we assist you?"></textarea><button className="w-full bg-[#0F3D3E] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-[#F5A623] transition-all transform hover:-translate-y-1">Send Message</button></form></div></div></section>
        )}
        {view === 'booking' && (<section className="pt-12 pb-32 px-6"><BookingForm tour={selectedTour} onSubmit={handleBooking} onCancel={() => setView('tours')} isSubmitting={isSubmitting} /></section>)}
        {view === 'success' && (<section className="py-72 text-center animate-fade-in px-10"><div className="w-32 h-32 bg-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-16 shadow-2xl"><CheckCircle className="text-white" size={72} /></div><h2 className="text-7xl md:text-[11rem] font-black text-[#0F3D3E] uppercase tracking-tighter leading-none mb-12">Confirmed.</h2><p className="text-3xl text-stone-500 max-w-2xl mx-auto font-medium leading-relaxed">Your expedition has been secured. Our concierge will be in touch shortly with your boarding credentials.</p><button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="mt-20 bg-[#0F3D3E] text-white px-20 py-9 rounded-full font-black uppercase transition-all hover:bg-[#F5A623] shadow-2xl tracking-[0.3em] text-base">Return Home</button></section>)}
      </main>
      <footer className="bg-[#0F3D3E] text-white pt-32 pb-16 px-6">
        <div className="max-w-[1440px] mx-auto text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20 border-b border-white/10 pb-20">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start"><Logo light /><p className="mt-8 text-white/40 text-sm leading-relaxed max-w-xs">Since 1994, we have provided discerning travelers with bespoke access to Canada's most powerful natural wonders.</p></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Company</h4><ul className="space-y-4 text-sm text-white/60"><li onClick={() => { setView('about'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors">Our Story</li><li onClick={() => { setView('contact'); window.scrollTo(0,0); }} className="hover:text-white cursor-pointer transition-colors">Contact Us</li><li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li><li className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</li></ul></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Connect</h4><ul className="space-y-4 text-sm text-white/60"><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><MapPin size={16} /> Toronto, ON</li><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><Instagram size={16} /> @NiagaraTours</li><li className="flex items-center gap-3 justify-center md:justify-start hover:text-white cursor-pointer transition-colors"><Facebook size={16} /> Niagara Tours</li></ul></div>
            <div><h4 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-10">Newsletter</h4><p className="text-white/40 text-xs mb-8">Receive travel insights and exclusive seasonal offers.</p><div className="flex flex-col gap-3"><input className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-[#F5A623] transition-all" placeholder="Email address" /><button className="bg-[#F5A623] text-[#0F3D3E] py-4 rounded-xl font-black uppercase text-[0.6rem] tracking-widest shadow-xl">Subscribe</button></div></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10"><p className="text-[0.55rem] font-bold uppercase tracking-[0.5em] text-white/20">© 2026 Niagara Tours Canada • A Premier Luxury Operator</p><div className="flex gap-10 text-[0.55rem] font-bold uppercase tracking-widest text-white/20"><span className="hover:text-white/60 cursor-pointer">Privacy Policy</span><span className="hover:text-white/60 cursor-pointer">Terms of Service</span></div></div>
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
