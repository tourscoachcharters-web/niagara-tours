// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvLSW-T46JLmnVYRGQ9WFO0UMno8AULuU", // Replace with your API key
  authDomain: "niagara-tours.firebaseapp.com",
  projectId: "niagara-tours",
  storageBucket: "niagara-tours.firebasestorage.app",
  messagingSenderId: "1098010109074",
  appId: "1:1098010109074:web:1f94e932a0d6967f87f24b"
};

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

// --- Your App Component Here ---

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
    const toursCollection = collection(db, 'artifacts', 'niagara-tours-v1', 'public', 'data', 'tours');
    const unsubscribe = onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          // Add your seed data here
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
      const bookingsRef = collection(db, 'artifacts', 'niagara-tours-v1', 'public', 'data', 'bookings');
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
      
      {/* Main Content Here */}
    </div>
  );
}