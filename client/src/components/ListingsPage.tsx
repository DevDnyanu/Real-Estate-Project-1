import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { getListingsApi, deleteListingApi } from "@/lib/api";

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getListingsApi();
      
      // Check if data exists and has listings array
      if (data && data.success && Array.isArray(data.listings)) {
        setListings(data.listings);
      } else if (data && Array.isArray(data)) {
        // If API returns array directly without success property
        setListings(data);
      } else {
        setError(data?.message || "Failed to load listings");
        setListings([]); // Ensure listings is always an array
      }
    } catch (err) {
      setError("Failed to load listings");
      console.error("Error loading listings:", err);
      setListings([]); // Ensure listings is always an array
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const data = await deleteListingApi(id);
      if (data && data.success) {
        setListings((prev) => prev.filter((x) => x._id !== id));
        alert("Listing deleted successfully");
      } else {
        alert("Failed to delete listing");
      }
    } catch (err) {
      alert("Failed to delete listing");
      console.error("Error deleting listing:", err);
    }
  };

  useEffect(() => { 
    loadListings(); 
  }, []);

  if (loading) return <div className="p-8 text-center">Loading listings...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">All Listings</h1>
      
      {/* Safe check for listings length */}
      {!listings || listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No listings found</p>
          <p className="text-gray-400">Create your first listing to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <PropertyCard
                property={{
                  id: listing._id,
                  title: listing.name,
                  location: listing.address,
                  price: `₹${listing.regularPrice?.toLocaleString()}`,
                  rentPrice: listing.type === "rent" ? `₹${listing.regularPrice}/month` : undefined,
                  type: listing.type,
                  propertyType: "Residential",
                  bedrooms: listing.bedrooms,
                  bathrooms: listing.bathrooms,
                  area: "1500",
                  image: listing.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
                  sellerPackage: "basic",
                  featured: listing.offer,
                  verified: true,
                }}
                onView={() => (window.location.href = `/edit/${listing._id}`)}
                onContact={() => console.log("Contact seller for:", listing._id)}
                onFavorite={() => console.log("Add to favorites:", listing._id)}
              />
              <div className="p-4 flex gap-2 border-t">
                <Button 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => (window.location.href = `/edit/${listing._id}`)}
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={() => onDelete(listing._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default ListingsPage;