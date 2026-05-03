import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Clock, Menu, X, Users, Star, Compass, Image as ImageIcon } from 'lucide-react';

// --- FIREBASE CONFIG (Hardcoded for Vercel) ---
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

const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  // Using simplified Unsplash URLs to avoid blocking errors
  const cleanSrc = src ? src.split('?')[0] + "?auto=format&w=1200&q=75" : src;
  
  if (!src || error) {
    return (
      <div className={`${className} bg-stone-200 flex flex-col items-center justify-center p-4`}>
        <ImageIcon className="text-stone-400 mb-2" size={32} />
        <span className="text-[0.6rem] font-bold text-stone-500 uppercase">Image Unavailable</span>
      </div>
    );
  }
  return <img src={cleanSrc} alt={alt} className={className} onError={() => setError(true)} />;
};

const Logo = ({ light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '40px', height: '40px', backgroundColor: '#F5A623', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '8px' }}>
      <Compass color={light ? "white" : "#0F3D3E"} size={24} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <span style={{ fontSize: '1.25rem', fontWeight: '900', color: light ? 'white' : '#0F3D3E', lineHeight: '1' }}>NIAGARA</span>
      <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.3em', color: '#F5A623', textTransform: 'uppercase' }}>Tours</span>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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
    return onSnapshot(toursCollection, (snap) => {
      if (snap.empty) {
        const seed = [
          { name: "The Grand Estate", price: 129, category: "Heritage", capacity: 48, duration: "9 Hours", image: "https://images.unsplash.com/photo-1549413240-3b9560376d54" },
          { name: "Sunset Illumination", price: 159, category: "Culinary", capacity: 24, duration: "6 Hours", image: "https://images.unsplash.com/photo-1552600213-90d571871a2e" }
        ];
        seed.forEach(t => setDoc(doc(toursCollection, t.name.toLowerCase().replace(/\s+/g, '-')), t));
      } else {
        setTours(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDFDF9', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, padding: '24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo light={view === 'home'} />
          <button onClick={() => setIsOpen(!isOpen)} style={{ color: view === 'home' ? 'white' : '#0F3D3E', background: 'none', border: 'none', cursor: 'pointer' }}>
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      {view === 'home' && (
        <main style={{ flexGrow: 1 }}>
          <section style={{ position: 'relative', height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <SafeImage src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.4)' }} />
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1280px', padding: '0 40px', textAlign: 'left' }}>
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-2 rounded-lg">
                <Star size={16} color="#F5A623" fill="#F5A623" />
                <span className="text-white text-[0.6rem] font-bold uppercase tracking-widest">Niagara's Premier Choice</span>
              </div>
              <h1 className="text-white font-black text-6xl md:text-8xl uppercase leading-none">Niagara <br/><span style={{ color: '#F5A623' }}>Redefined.</span></h1>
              <p className="text-white/80 mt-6 max-w-lg text-lg">Luxury small-group departures from Toronto. Experience the power and majesty with world-class hospitality.</p>
              <button onClick={() => setView('tours')} className="mt-10 bg-[#F5A623] text-[#0F3D3E] px-10 py-5 rounded-full font-black uppercase text-sm">Explore Collections</button>
            </div>
          </section>
          
          <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 40px' }}>
            <h2 className="text-4xl font-black text-[#0F3D3E] uppercase mb-12">Signature Journeys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {tours.map(t => (
                <div key={t.id} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                  <div className="h-64 overflow-hidden">
                    <SafeImage src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 text-left">
                    <h3 className="text-2xl font-black text-[#0F3D3E] uppercase">{t.name}</h3>
                    <div className="flex gap-4 mt-4 text-stone-400 font-bold text-xs">
                       <div className="flex items-center gap-1"><Clock size={14} /> {t.duration}</div>
                       <div className="flex items-center gap-1"><Users size={14} /> {t.capacity} Seats</div>
                    </div>
                    <button className="mt-6 w-full bg-[#0F3D3E] text-white py-4 rounded-xl font-black uppercase">Book Now — ${t.price}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer style={{ backgroundColor: '#0F3D3E', padding: '80px 0', textAlign: 'center', color: 'white' }}>
        <Logo light />
        <p style={{ marginTop: '40px', opacity: 0.3, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.4em' }}>© 2026 NIAGARA TOURS CANADA</p>
      </footer>
    </div>
  );
}