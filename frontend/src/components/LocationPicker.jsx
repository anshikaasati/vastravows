import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Loader, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onLocationSelect, onClose, initialLocation }) => {
    // Default to New Delhi if no initial location
    const [position, setPosition] = useState(initialLocation || { lat: 28.6139, lng: 77.2090 });
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [fetchingAddress, setFetchingAddress] = useState(false);
    const [structuredAddress, setStructuredAddress] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;
        if (mapInstanceRef.current) return; // Already initialized

        // Create map
        const map = L.map(mapRef.current).setView([position.lat, position.lng], 13);
        mapInstanceRef.current = map;

        // Add Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add Marker
        const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Handle Marker Drag
        marker.on('dragend', function (event) {
            const marker = event.target;
            const newPos = marker.getLatLng();
            setPosition({ lat: newPos.lat, lng: newPos.lng });
            fetchAddressWithState(newPos.lat, newPos.lng);
        });

        // Handle Map Click
        map.on('click', function (e) {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setPosition({ lat, lng });
            map.flyTo([lat, lng], map.getZoom());
            fetchAddressWithState(lat, lng);
        });

        // Add Search Control
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Search for a location...',
        });
        map.addControl(searchControl);

        // Handle Search Result
        map.on('geosearch/showlocation', (result) => {
            if (result && result.location) {
                const { x, y } = result.location; // x: lng, y: lat
                const newPos = { lat: y, lng: x };
                setPosition(newPos);

                // Update marker
                if (markerRef.current) {
                    markerRef.current.setLatLng([y, x]);
                }

                // Fetch structured address
                fetchAddressWithState(y, x);
            }
        });

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Handle External Position Updates (e.g. "Use My Location")
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            const currentCenter = mapInstanceRef.current.getCenter();
            // Only flyTo if the distance is significant to avoid jitter or if it's the first load
            const dist = mapInstanceRef.current.distance(currentCenter, [position.lat, position.lng]);

            if (dist > 10) { // arbitrary small distance
                mapInstanceRef.current.flyTo([position.lat, position.lng], 13);
                markerRef.current.setLatLng([position.lat, position.lng]);
            }
        }
    }, [position]);

    // Initial Address Fetch
    useEffect(() => {
        if (initialLocation) {
            fetchAddressWithState(initialLocation.lat, initialLocation.lng);
            setLoading(false);
        } else {
            getCurrentLocation();
        }
    }, []);

    // Function to get current location manually
    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setPosition(newPos);
                    fetchAddressWithState(latitude, longitude);
                    setLoading(false);
                    setGettingLocation(false);
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setLoading(false);
                    setGettingLocation(false);
                }
            );
        } else {
            setLoading(false);
            setGettingLocation(false);
        }
    };

    const fetchAddressWithState = async (lat, lng) => {
        setFetchingAddress(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (response.data) {
                setAddress(response.data.display_name);
                const addressObj = response.data.address;
                const city = addressObj.city || addressObj.town || addressObj.village || addressObj.state_district;
                const pincode = addressObj.postcode;

                setStructuredAddress({
                    address: response.data.display_name,
                    city: city || '',
                    pincode: pincode || '',
                    lat,
                    lng
                });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setAddress('Address lookup failed');
        } finally {
            setFetchingAddress(false);
        }
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-display font-bold text-gray-900">Pin Location</h2>
                        <p className="text-xs text-gray-500 mt-1">Search or drag map to select delivery location</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <div className="flex-1 relative bg-gray-50 flex flex-col">
                    {/* Map Container */}
                    <div className="flex-1 relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
                                <Loader className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Vanilla Leaflet Map Div */}
                        <div
                            ref={mapRef}
                            style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
                        />

                        {/* Use My Location Button overlay */}
                        <button
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-gray-700 border border-gray-100"
                            title="Use my location"
                        >
                            {gettingLocation ? (
                                <Loader className="w-6 h-6 animate-spin text-primary" />
                            ) : (
                                <Navigation className="w-6 h-6 text-primary" />
                            )}
                        </button>
                    </div>

                    {/* Bottom Panel */}
                    <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selected Location</p>
                            {fetchingAddress ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Fetching address details...</span>
                                </div>
                            ) : (
                                <div className="flex gap-3 items-start">
                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                                            {address || 'No location selected'}
                                        </p>
                                        {structuredAddress && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {structuredAddress.city ? `${structuredAddress.city}, ` : ''}{structuredAddress.pincode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (structuredAddress) {
                                        onLocationSelect(structuredAddress);
                                    }
                                }}
                                disabled={!structuredAddress || fetchingAddress}
                                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
