import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { MapPin, Navigation, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onLocationSelect, onClose }) => {
    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [fetchingAddress, setFetchingAddress] = useState(false);

    // Component to handle map clicks and marker dragging
    const LocationMarker = () => {
        const map = useMapEvents({
            click(e) {
                setPosition(e.latlng);
                fetchAddress(e.latlng.lat, e.latlng.lng);
            },
        });

        useEffect(() => {
            if (position) {
                map.flyTo(position, map.getZoom());
            }
        }, [position, map]);

        return position === null ? null : (
            <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const newPos = e.target.getLatLng();
                        setPosition(newPos);
                        fetchAddress(newPos.lat, newPos.lng);
                    },
                }}
            />
        );
    };

    // Get current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    fetchAddress(latitude, longitude);
                    setLoading(false);
                },
                (err) => {
                    console.error(err);
                    // Default to New Delhi if geolocation fails
                    setPosition({ lat: 28.6139, lng: 77.2090 });
                    setLoading(false);
                }
            );
        } else {
            setPosition({ lat: 28.6139, lng: 77.2090 });
            setLoading(false);
        }
    }, []);

    // Function to get current location manually
    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    fetchAddress(latitude, longitude);
                    setGettingLocation(false);
                },
                (err) => {
                    console.error(err);
                    alert('Unable to get your location. Please select manually on the map.');
                    setGettingLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
            setGettingLocation(false);
        }
    };

    const fetchAddress = async (lat, lng) => {
        setFetchingAddress(true);
        try {
            // Using OpenStreetMap Nominatim API
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (response.data) {
                setAddress(response.data.display_name);
                // Parse address components if possible
                const addressObj = response.data.address;
                const city = addressObj.city || addressObj.town || addressObj.village || addressObj.state_district;
                const pincode = addressObj.postcode;

                onLocationSelect({
                    address: response.data.display_name,
                    city: city || '',
                    pincode: pincode || '',
                    lat,
                    lng
                });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setFetchingAddress(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with Use My Location button */}
            <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-lg flex-1 text-sm text-blue-800 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Click anywhere on the map or drag the marker to pin your exact location.</p>
                </div>
                <button
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="ml-3 flex items-center gap-2 px-4 py-2.5 bg-primary-berry text-white rounded-lg hover:bg-primary-berry/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {gettingLocation ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Navigation className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold whitespace-nowrap">
                        {gettingLocation ? 'Getting...' : 'Use My Location'}
                    </span>
                </button>
            </div>

            <div className="relative flex-1 min-h-[300px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin text-primary-berry mx-auto mb-2" />
                            <p className="text-gray-500">Loading map...</p>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={position || [28.6139, 77.2090]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker />
                    </MapContainer>
                )}
            </div>

            <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Selected Address:</p>
                {fetchingAddress ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Loader className="w-4 h-4 animate-spin text-primary-berry" />
                        <span className="text-sm text-gray-600">Fetching address...</span>
                    </div>
                ) : (
                    <div className="text-sm font-medium text-gray-900 bg-gradient-to-r from-primary-berry/10 to-primary-berry/5 p-4 rounded-lg border-2 border-primary-berry/20">
                        {address || 'No location selected'}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onClose}
                    disabled={!position}
                    className="px-6 py-2.5 bg-primary-berry text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
};

export default LocationPicker;
