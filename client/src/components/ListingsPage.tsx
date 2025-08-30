// src/pages/ListingsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { getListingsApi, deleteListingApi } from "@/lib/api";

const ListingsPage = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await getListingsApi();

      if (data && data.success && Array.isArray(data.listings)) {
        setListings(data.listings);
      } else if (Array.isArray(data)) {
        setListings(data);
      } else {
        setError(data?.message || "Failed to load listings");
        setListings([]);
      }
    } catch (err) {
      console.error("Error loading listings:", err);
      setError("Failed to load listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const data = await deleteListingApi(id);
      if (data?.success) {
        setListings((prev) => prev.filter((x) => x._id !== id));
        alert("Listing deleted successfully ✅");
      } else {
        alert("Failed to delete listing ❌");
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing ❌");
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadListings} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🏠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Create your first listing to get started!</p>
            <Button 
              onClick={() => navigate("/create-listing")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Listing
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {listings.filter(l => l.type === 'sale').length}
                </div>
                <div className="text-sm text-gray-600">For Sale</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {listings.filter(l => l.type === 'rent').length}
                </div>
                <div className="text-sm text-gray-600">For Rent</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard
                  key={listing._id}
                  property={{
                    id: listing._id,
                    title: listing.name || "Untitled Property",
                    location: listing.address || "Location not specified",
                    price: `₹${listing.regularPrice?.toLocaleString('en-IN') || "0"}`,
                    rentPrice: listing.type === "rent" ? `₹${listing.regularPrice?.toLocaleString('en-IN')}/month` : undefined,
                    type: listing.type || "sale",
                    propertyType: listing.propertyType || "Residential",
                    bedrooms: listing.bedrooms || 0,
                    bathrooms: listing.bathrooms || 0,
                    area: listing.squareFootage || listing.area || "0",
                    image: listing.images?.[0],  // ✅ only uploaded image, no fallback
                    featured: listing.offer || false,
                    verified: true,
                  }}
                  onView={() => navigate(`/listing/${listing._id}`)}
                  onContact={() => console.log("Contact seller for:", listing._id)}
                  onFavorite={() => console.log("Add to favorites:", listing._id)}
                  showActions={true}
                  onEdit={() => navigate(`/edit/${listing._id}`)}
                  onDelete={() => onDelete(listing._id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ListingsPage;
