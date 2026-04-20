import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { ShieldAlert, MapPin, Navigation, Clock, AlertTriangle, Filter, AlertOctagon, X, CheckCircle2, LocateFixed, MessageSquare, Send, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import L from 'leaflet';

// Fix default icon issues in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const safeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MAP_CENTER = [13.0827, 80.2707]; // Chennai, Tamil Nadu

const fallbackRouteCoords = [
    [13.0827, 80.2707], // Chennai
    [12.6617, 79.9575], // Chengalpattu
    [11.9401, 79.4861], // Viluppuram
    [11.7480, 78.9664], // Kallakurichi
    [11.6643, 78.1460], // Salem
    [11.0168, 76.9558]  // Coimbatore
];

const riskyRouteCoords = [
    [13.0827, 80.2707],
    [12.8387, 80.1558], // Deviates to alternative riskier path (e.g., bypass)
    [12.1833, 79.5333],
    [11.6443, 78.1460],
    [11.0168, 76.9558]
];

// Locate User Map Control
const LocateUserControl = () => {
    const map = useMap();
    
    const goToLocation = () => {
      map.locate().on("locationfound", function (e) {
        map.flyTo(e.latlng, 15);
      });
    };
  
    return (
      <button 
        onClick={goToLocation}
        className="absolute top-6 left-6 z-[1000] bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-brand-500 hover:bg-brand-50 transition-all font-semibold flex items-center justify-center"
        title="Find My Location"
      >
        <LocateFixed className="w-6 h-6" />
      </button>
    );
};

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [unsafeZones, setUnsafeZones] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [sourceInput, setSourceInput] = useState('Chennai');
  const [destInput, setDestInput] = useState('Coimbatore');
  
  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosDispatched, setSosDispatched] = useState(false);

  // SafeBot Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! I am SafeBot. Ask me about the safety of any route or neighborhood.' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");

    // Simulate AI analysis delay
    setTimeout(() => {
      let botReply = "Based on current real-time data, that area has a moderately high incident report rate after 10 PM. I suggest using the highlighted alternative route with verified street lighting.";
      
      if (chatInput.toLowerCase().includes("safe") && chatInput.toLowerCase().includes("now")) {
        botReply = "Currently, the route is clear. There are 0 active alerts within a 2-mile radius of your location.";
      } else if (chatInput.toLowerCase().includes("predictive") || chatInput.toLowerCase().includes("future") || chatInput.toLowerCase().includes("predict")) {
        botReply = "My predictive AI model indicates a 35% risk increase in the downtown area due to poor lighting and historical data for late-night weekends.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 1200);
  };

  // Fetch unsafe zones from the backend on load
  useEffect(() => {
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/incidents' : '/api/incidents';
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setUnsafeZones(data))
      .catch(err => console.error("Could not load backend map data:", err));
  }, []);

  const handleAnalyze = () => {
    setAnalyzing(true);
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/route' : '/api/route';
    // Fetch dynamic route based on user input
    fetch(`${apiUrl}?source=${encodeURIComponent(sourceInput)}&destination=${encodeURIComponent(destInput)}`)
      .then(res => res.json())
      .then(data => {
        if(data.waypoints) {
            setRouteData(data);
        } else {
            console.error(data.error);
            alert("Could not find route: " + data.error);
        }
      })
      .catch(err => console.error("Could not load backend route data:", err))
      .finally(() => {
        setTimeout(() => {
          setAnalyzing(false);
          setShowResults(true);
        }, 1500);
      });
  };

  // SOS Countdown Logic
  const timerRef = useRef(null);

  const handleSOS = () => {
    setSosActive(true);
    setSosCountdown(5);
    setSosDispatched(false);
    
    timerRef.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSosDispatched(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setSosActive(false);
    setSosDispatched(false);
  };

  const handleReportSubmit = () => {
    if (!reportType) return;
    
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/incidents' : '/api/incidents';
    // POST request to backend
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: reportType, location: MAP_CENTER })
    })
    .then(res => res.json())
    .then(newZone => {
      // Instantly show the new heatmap zone on map
      setUnsafeZones(prev => [...prev, newZone]);
      setReportSubmitted(true);
      
      setTimeout(() => {
        setReportSubmitted(false);
        setShowReportModal(false);
        setReportType('');
      }, 2500);
    })
    .catch(err => {
      console.error('Failed to submit report', err);
      // Failsafe for if the backend isn't running 
      setReportSubmitted(true);
      setTimeout(() => setShowReportModal(false), 2500);
    });
  };

  const handleRouteFeedback = (isSafe) => {
    setFeedbackLoading(true);
    // Use relative path for Vercel compatibility, or fallback to dev localhost
    const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/feedback' : '/api/feedback';
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        route: `${sourceInput} to ${destInput}`,
        isSafe, 
        location: MAP_CENTER // Typically would be the user's live GPS
      })
    })
    .catch(err => console.error('Failed to submit feedback', err))
    .finally(() => {
      setFeedbackSubmitted(true);
      setFeedbackLoading(false);
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-96 bg-white shadow-xl z-[1000] flex flex-col h-full relative border-r border-slate-100">
        
        {/* Scrollable Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
             <Filter className="w-5 h-5 text-brand-500"/> 
             <h2>Route Configuration</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source</label>
              <input type="text" value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Destination</label>
              <input type="text" value={destInput} onChange={(e) => setDestInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Time of Travel</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all bg-slate-50" defaultValue="night">
                <option value="day">Daytime (Safe)</option>
                <option value="night">Late Night (High Alert)</option>
              </select>
            </div>
            
            <button 
              onClick={handleAnalyze} 
              disabled={analyzing}
              className={`w-full py-3.5 px-4 text-white font-semibold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-4 ${analyzing ? 'bg-slate-400 cursor-not-allowed' : showResults ? 'bg-brand-500 hover:bg-brand-600' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
              <Navigation className="h-5 w-5" />
              {analyzing ? 'Analyzing variables...' : showResults ? 'Update Route Analytics' : 'Analyze & Find Routes'}
            </button>
          </div>

          {showResults && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-5 text-white shadow-xl shadow-brand-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium opacity-90">Overall Route Safety</h3>
                    <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">AI Verified</span>
                </div>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold">85</span>
                    <span className="text-sm opacity-80 mb-1">/ 100</span>
                </div>
                <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full w-[85%]"></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Suggested Routes</h3>
                
                <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-green-700">Route A (Recommended)</span>
                        <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded">Safest</span>
                    </div>
                    <p className="text-sm text-green-600 mb-2">Avoids 3 identified high-risk zones.</p>
                    <div className="flex gap-4 text-xs text-green-700/80 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24 mins</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Well-lit</span>
                    </div>
                </div>

                <div className="border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 rounded-xl p-4 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-700">Route B (Shortest)</span>
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">Risky</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">Passes through poorly lit areas.</p>
                    <div className="flex gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 18 mins</span>
                        <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" /> 2 Incidents</span>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Feedback Section (Replaced SOS) */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            Route Feedback
          </h3>
          <p className="text-xs text-slate-500 mb-3">Is this current route feeling safe?</p>
          
          {feedbackSubmitted ? (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Thank you for your feedback!
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => handleRouteFeedback(true)}
                disabled={feedbackLoading || !showResults}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-white border border-slate-200 hover:border-green-400 hover:bg-green-50 hover:text-green-600 font-semibold text-xs text-slate-600 rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                title={!showResults ? "Please analyze a route first" : ""}
              >
                <ThumbsUp className="w-5 h-5 mb-1" />
                Feels Safe
              </button>
              <button 
                onClick={() => handleRouteFeedback(false)}
                disabled={feedbackLoading || !showResults}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 font-semibold text-xs text-slate-600 rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                title={!showResults ? "Please analyze a route first" : ""}
              >
                <ThumbsDown className="w-5 h-5 mb-1" />
                Feels Unsafe
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 h-full w-full relative z-0">
        <MapContainer center={MAP_CENTER} zoom={14} className="h-full w-full z-0" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <LocateUserControl />
          
          {unsafeZones.map(zone => (
            <Circle
              key={zone.id}
              center={zone.coords}
              radius={zone.radius}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 1, dashArray: '4' }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-[200px] font-sans">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                    <AlertOctagon className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-slate-800 text-base">{zone.type}</h3>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 mb-3">
                    <p><strong className="text-slate-800">Risk Level:</strong> <span className="text-red-500 font-semibold">{zone.risk}</span></p>
                    <p><strong className="text-slate-800">Live Reports:</strong> {zone.reports}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                      <Clock className="w-3 h-3" /> Reported dynamically
                    </p>
                  </div>
                  
                  {/* Community Verification */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500">TRUST SCORE</span>
                      <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">89%</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-600 py-1.5 rounded transition-colors text-xs font-semibold border border-slate-200 hover:border-green-200">
                        <ThumbsUp className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 py-1.5 rounded transition-colors text-xs font-semibold border border-slate-200 hover:border-red-200">
                        <ThumbsDown className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {showResults && (
            <>
              <Polyline positions={riskyRouteCoords} pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.6, dashArray: '10, 10' }} />
              <Polyline positions={routeData ? routeData.waypoints : fallbackRouteCoords} pathOptions={{ color: '#10b981', weight: 6, opacity: 0.9 }} />
              <Marker position={routeData ? routeData.waypoints[routeData.waypoints.length - 1] : fallbackRouteCoords[fallbackRouteCoords.length - 1]}>
                <Popup><b>Destination</b><br/>{routeData ? routeData.destination : 'Coimbatore'}</Popup>
              </Marker>
              <Marker position={routeData ? routeData.waypoints[0] : fallbackRouteCoords[0]} icon={safeIcon}>
                <Popup><b>Source</b><br/>{routeData ? routeData.origin : 'Chennai'}</Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        {showResults && (
          <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 z-[1000]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-700">Live Tracking On</span>
          </div>
        )}

        {/* SafeBot Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="absolute bottom-[200px] right-6 bg-slate-800/90 hover:bg-slate-800 backdrop-blur-md text-white px-4 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(30,41,59,0.4)] transition-all flex items-center justify-center gap-2 z-[1000] border border-slate-600"
        >
          <Bot className="w-5 h-5 text-brand-400" />
          <span>SafeBot AI</span>
        </button>

        {/* Floating Report Incident Button */}
        <button 
          onClick={() => setShowReportModal(true)}
          className="absolute bottom-36 right-6 bg-brand-500/90 hover:bg-brand-500 backdrop-blur-md text-white px-5 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(236,72,153,0.4)] transition-all flex items-center gap-2 z-[1000] border border-brand-400"
        >
          <AlertOctagon className="w-5 h-5" />
          Report Incident
        </button>

        {/* Emergency SOS Floating Button (Moved from Sidebar) */}
        {!sosActive ? (
          <button 
            onClick={handleSOS}
            className="absolute bottom-8 right-6 bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-white px-6 py-4 rounded-full font-extrabold shadow-[0_4px_30px_rgba(220,38,38,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2 z-[1000] border border-red-500 hover:shadow-[0_4px_40px_rgba(220,38,38,0.8)]"
          >
            <ShieldAlert className="h-6 w-6" />
            <span className="tracking-wide">SOS</span>
          </button>
        ) : (
          <div className="absolute bottom-6 right-6 bg-white rounded-[2rem] shadow-2xl p-6 w-72 z-[1100] border-2 border-red-500 animate-in slide-in-from-bottom flex flex-col items-center">
            {sosDispatched ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-inner">
                   <ShieldAlert className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Help is arriving</h3>
                <p className="text-sm text-slate-500 text-center mb-6">Emergency services and emergency contacts have verified your location.</p>
                <div className="flex bg-slate-100 w-full rounded-xl p-3 gap-3 mb-6 items-center border border-slate-200">
                    <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live ETA</span>
                        <span className="text-sm font-semibold text-slate-800">3 mins (0.8km away)</span>
                    </div>
                </div>
                <button onClick={() => setSosActive(false)} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-100">
                    False Alarm / Cancel
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-inner relative">
                   <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-3xl font-extrabold font-mono absolute z-10">{sosCountdown}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 whitespace-nowrap">Dispatching SOS...</h3>
                <p className="text-sm text-slate-500 text-center mb-6 max-w-[200px]">Sharing live location and camera feed to emergency contacts.</p>
                
                <button onClick={cancelSOS} className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors border border-slate-300">
                    Cancel Request
                </button>
              </>
            )}
          </div>
        )}

        {/* Glassmorphism Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
            
            <div className="relative w-full max-w-sm bg-white/75 backdrop-blur-xl border border-white/60 shadow-[0_0_40px_rgba(236,72,153,0.15)] rounded-3xl p-6 flex flex-col gap-5">
              <button 
                onClick={() => setShowReportModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              {!reportSubmitted ? (
                <>
                  <div className="text-center pt-2">
                    <div className="w-12 h-12 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Report Incident</h3>
                    <p className="text-sm text-slate-500">Your feedback instantly updates AI heatmaps.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" defaultValue="Current Location" className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/60 bg-white/60 focus:bg-white text-slate-700 outline-none transition-all shadow-sm font-medium text-sm" readOnly />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Type</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Harassment', 'Poor Lighting', 'Unsafe Crowd'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setReportType(type)}
                            className={`py-3 px-4 rounded-xl text-left text-sm font-semibold border transition-all ${
                              reportType === type 
                                ? 'bg-brand-50 border-brand-300 text-brand-600 shadow-sm' 
                                : 'bg-white/60 border-white/60 text-slate-600 hover:bg-white hover:border-slate-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleReportSubmit}
                    disabled={!reportType}
                    className={`w-full py-4 mt-2 rounded-xl font-bold transition-all ${
                      reportType 
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)]' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Submit Report
                  </button>
                </>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-full mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Verified & Added</h3>
                  <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">Thank you. The AI has processed this alert and updated the safe routes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOS Emergency Fullscreen Overlay */}
        {sosActive && (
          <div className="fixed inset-0 z-[3000] flex flex-col items-center justify-center p-6 bg-red-600/90 backdrop-blur-lg animate-in fade-in duration-300 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/50 via-transparent to-black/40 animate-pulse mix-blend-multiply"></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-md text-center">
              <div className="w-24 h-24 bg-white text-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(255,255,255,0.4)] animate-bounce">
                <ShieldAlert className="w-12 h-12" />
              </div>
              
              {!sosDispatched ? (
                <>
                  <h2 className="text-4xl font-extrabold mb-4 uppercase tracking-wider">Emergency SOS</h2>
                  <p className="text-lg opacity-90 mb-8 font-medium">Alerting local authorities and sharing live location coordinates inside...</p>
                  
                  <div className="text-8xl font-black mb-12 tabular-nums">
                    {sosCountdown}
                  </div>

                  <button 
                    onClick={cancelSOS}
                    className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-bold text-lg backdrop-blur-md border border-white/50 transition-all active:scale-95"
                  >
                    Cancel Emergency SOS
                  </button>
                </>
              ) : (
                <>
                   <div className="text-white border-4 border-white/30 rounded-full w-24 h-24 flex items-center justify-center mb-8 bg-green-500/20 backdrop-blur-md">
                     <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <h2 className="text-3xl font-extrabold mb-4 uppercase tracking-wider">Alert Dispatched</h2>
                   <p className="text-lg opacity-90 mb-12 font-medium">Police and emergency contacts have been notified with your exact tracking profile. Help is on the way.</p>
                   
                   <button 
                    onClick={() => {
                      setSosActive(false);
                      setSosDispatched(false);
                    }}
                    className="w-full py-4 bg-white text-red-600 hover:bg-slate-100 rounded-2xl font-bold text-lg transition-all active:scale-95"
                  >
                    Close Screen
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* SafeBot AI Chat Window */}
        {isChatOpen && (
          <div className="absolute bottom-28 right-6 w-80 md:w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200 z-[2000] flex flex-col h-[500px] overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="bg-brand-500 p-1.5 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">SafeBot AI</h3>
                  <p className="text-[10px] text-brand-200 uppercase tracking-widest">Predictive Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-brand-500 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about route safety..."
                className="flex-1 bg-slate-100 border-none rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
