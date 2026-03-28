import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Facility } from '../types';
import { MapPin, Search, Clock, Info, Navigation, ExternalLink, Phone, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Locator: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noNearbyFound, setNoNearbyFound] = useState(false);

  // Function to request user location and load nearby facilities
  const requestUserLocation = async () => {
    if ("geolocation" in navigator) {
      setLoadingLocation(true);
      setLocationDenied(false);
      setNoNearbyFound(false);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({
            lat: userLat,
            lng: userLng
          });
          
          // Try to load nearby facilities from Gemini API
          let nearbyFacilitiesFound = false;
          try {
            const nearbyFacilities = await api.findNearbyFacilitiesWithAI(userLat, userLng, 100);
            if (nearbyFacilities && Array.isArray(nearbyFacilities) && nearbyFacilities.length > 0) {
              nearbyFacilitiesFound = true;
              // Merge with existing facilities, avoiding duplicates
              const combinedFacilities = [
                ...facilities,
                ...nearbyFacilities.filter((nf: any) => 
                  !facilities.some(f => f.name.toLowerCase() === nf.name.toLowerCase())
                ).map((nf: any, idx: number) => ({
                  id: `gemini-${idx}`,
                  name: nf.name,
                  address: nf.address,
                  city: nf.city,
                  phone: nf.phone,
                  distance: `${nf.distance} km`,
                  lat: nf.lat || userLat,
                  lng: nf.lng || userLng,
                  acceptedItems: Array.isArray(nf.acceptedItems) ? nf.acceptedItems : (nf.acceptedItems?.split(',').map((s: string) => s.trim()) || []),
                  hours: nf.hours || 'N/A'
                }))
              ];
              setFacilities(combinedFacilities);
              setNoNearbyFound(false);
            } else {
              // No nearby facilities found from Gemini
              setNoNearbyFound(true);
            }
          } catch (err) {
            console.error("Error loading facilities from Gemini:", err);
            // Show message that no nearby facilities found
            setNoNearbyFound(true);
          }
          
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationDenied(true);
          setLoadingLocation(false);
        }
      );
    }
  };

  // Function to refresh facilities and location
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload facilities from database
      const data = await api.getFacilities();
      setFacilities(data);
      
      // Request fresh location and load nearby facilities with Gemini
      await requestUserLocation();
    } catch (err) {
      console.error("Failed to refresh facilities", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const data = await api.getFacilities();
        setFacilities(data);
      } catch (err) {
        console.error("Failed to load facilities", err);
      }
    };
    loadFacilities();
    
    // Request user location on mount
    requestUserLocation();
  }, []);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const openInGoogleMaps = (facility: Facility) => {
    const query = encodeURIComponent(`${facility.name}, ${facility.address}, ${facility.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getDirections = (facility: Facility) => {
    const destination = encodeURIComponent(`${facility.address}, ${facility.city}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const filteredFacilities = facilities
    .map(f => {
      if (userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, f.lat, f.lng);
        return { ...f, dynamicDistance: dist };
      }
      return { ...f, dynamicDistance: Infinity };
    })
    .filter(f => {
      const matchesSearch = 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.acceptedItems.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    })
    .sort((a, b) => (a.dynamicDistance || 0) - (b.dynamicDistance || 0));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Locator</h1>
          <p className="text-gray-500">Find authorized e-waste collection centers near you.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {loadingLocation && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full animate-pulse">
              <MapPin className="h-4 w-4" />
              <span>Detecting location...</span>
            </div>
          )}
          {userLocation && !loadingLocation && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span>Location active</span>
            </div>
          )}
          {!userLocation && !loadingLocation && (
            <button
              onClick={requestUserLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>Use My Location</span>
            </button>
          )}
          {locationDenied && !loadingLocation && (
            <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
              <Info className="h-4 w-4" />
              <span>Location access denied</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loadingLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, address, or items (e.g., Laptop, Mobile)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {noNearbyFound && userLocation && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900">No E-Waste Centers Nearby</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    No authorized e-waste recycling centers were found within 100km of your location. 
                    Showing available facilities below for your reference.
                  </p>
                </div>
              </div>
            </div>
          )}
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <motion.div
                key={facility.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedFacility(facility)}
                className={cn(
                  "p-6 rounded-2xl border transition-all cursor-pointer group",
                  selectedFacility?.id === facility.id
                    ? "bg-green-50 border-green-200 shadow-md"
                    : "bg-white border-gray-100 hover:border-green-200 hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      selectedFacility?.id === facility.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600"
                    )}>
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{facility.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Navigation className="h-3 w-3 mr-1" />
                        {facility.address} • {userLocation && (facility as any).dynamicDistance !== Infinity ? `${(facility as any).dynamicDistance.toFixed(1)} km` : facility.distance}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Authorized
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {facility.acceptedItems.map(item => (
                    <span key={item} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(facility);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Get Directions</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(facility);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View on Map</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No facilities match your search.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <AnimatePresence mode="wait">
              {selectedFacility ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={selectedFacility.id}
                  className="space-y-6"
                >
                  <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative">
                    <img 
                      src={`https://picsum.photos/seed/${selectedFacility.id}/400/200`} 
                      alt={selectedFacility.name}
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <h2 className="absolute bottom-4 left-4 text-white font-bold text-xl">{selectedFacility.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">{selectedFacility.address}, {selectedFacility.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Working Hours</p>
                        <p className="text-sm text-gray-600">{selectedFacility.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{selectedFacility.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Accepted Items</p>
                        <p className="text-sm text-gray-600">{selectedFacility.acceptedItems.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => getDirections(selectedFacility)}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
                    >
                      <Navigation className="h-5 w-5" />
                      <span>Get Directions</span>
                    </button>
                    <button
                      onClick={() => openInGoogleMaps(selectedFacility)}
                      className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>Open in Google Maps</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500">Select a facility to view more details and directions.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locator;
