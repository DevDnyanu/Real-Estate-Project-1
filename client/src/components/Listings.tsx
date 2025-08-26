import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BASE = "http://localhost:5000"; 
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${BASE}/api/listings`);
        const data = await res.json();
        
        console.log('API Response:', data); // Debug 
        
        if (data.success === false) {
          setError(data.message);
          setLoading(false);
          return;
        }
        
        // यहाँ 'data.listings' use करें क्योंकि backend से यही format आ रहा है
        setListings(data.listings || data.data || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading properties...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Property Listings</h1>
      
      {!listings || listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found</p>
          <p className="text-gray-400">Be the first to create a listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PropertyCard
              key={listing._id}
              property={{
                id: listing._id,
                title: listing.name,
                location: listing.address,
                price: `₹${listing.regularPrice?.toLocaleString('en-IN')}`,
                rentPrice: listing.type === 'rent' ? `₹${listing.regularPrice}/month` : undefined,
                type: listing.type,
                propertyType: 'Residential',
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                area: '1500',
                image: listing.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
                sellerPackage: 'basic',
                featured: listing.offer,
                verified: true,
              }}
              onView={() => console.log('View details:', listing._id)}
              onContact={() => console.log('Contact seller:', listing._id)}
              onFavorite={() => console.log('Add to favorites:', listing._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;