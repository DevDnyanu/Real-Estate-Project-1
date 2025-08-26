import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getListingApi, updateListingApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  MapPin, 
  FileText, 
  DollarSign, 
  Bed, 
  Bath,
  Car,
  Sofa,
  Tag,
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getListingApi(id);
        if (data.success) {
          setFormData(data.listing);
        } else {
          setError(data.message || "Failed to load listing");
        }
      } catch (e) {
        setError("Failed to load listing data");
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    if (!formData) return;
    
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({ ...formData, type: e.target.id });
      return;
    }
    
    if (['parking', 'furnished', 'offer'].includes(e.target.id)) {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
      return;
    }
    
    const isNumber = e.target.type === 'number';
    let newValue = isNumber ? parseInt(e.target.value) || 0 : e.target.value;
    
    // Prevent zero values for bedrooms, bathrooms, and regularPrice
    if (isNumber && ['bedrooms', 'bathrooms', 'regularPrice'].includes(e.target.id) && newValue === 0) {
      return;
    }
    
    setFormData({
      ...formData,
      [e.target.id]: newValue,
    });
  };

  const handleNumberChange = (field, increment) => {
    if (!formData) return;
    
    const currentValue = formData[field];
    let newValue = increment ? currentValue + 1 : currentValue - 1;
    
    // Set minimum values
    if (field === 'bedrooms' || field === 'bathrooms') {
      newValue = Math.max(1, Math.min(6, newValue));
    } else if (field === 'regularPrice') {
      newValue = Math.max(1000000, Math.min(20000000, newValue));
    }
    
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(price);
  };

  const parsePrice = (formattedPrice) => {
    return parseInt(formattedPrice.replace(/,/g, '')) || 0;
  };

  const handlePriceChange = (e, field) => {
    if (!formData) return;
    
    const value = e.target.value;
    const numericValue = parsePrice(value);
    
    // Don't allow zero for regularPrice
    if (field === 'regularPrice' && numericValue === 0) {
      return;
    }
    
    setFormData({
      ...formData,
      [field]: numericValue
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      // Create payload without MongoDB-specific fields
      const payload = { ...formData };
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      delete payload.userRef;
      
      const data = await updateListingApi(id, payload);
      
      if (data.success) {
        setSuccess("Listing updated successfully!");
        setTimeout(() => {
          navigate("/listings");
        }, 1500);
      } else {
        setError(data.message || "Update failed");
      }
    } catch (e) {
      setError(e.message || "An error occurred during update");
    } finally {
      setSaving(false);
    }
  };

  if (!formData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/listings")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Property Listing</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Basic Info */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Property Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Middle Column - Property Details */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-4 w-4 text-blue-600" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Property Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.type === 'sale' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="sale"
                      className="w-4 h-4 text-blue-600"
                      onChange={handleChange}
                      checked={formData.type === 'sale'}
                    />
                    <span className="font-medium">For Sale</span>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.type === 'rent' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="rent"
                      className="w-4 h-4 text-blue-600"
                      onChange={handleChange}
                      checked={formData.type === 'rent'}
                    />
                    <span className="font-medium">For Rent</span>
                  </label>
                </div>
              </div>

              {/* Property Features */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Property Features</Label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.parking 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="parking"
                      className="w-4 h-4 text-green-600"
                      onChange={handleChange}
                      checked={formData.parking}
                    />
                    <Car className="h-4 w-4" />
                    <span className="font-medium">Parking</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.furnished 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="furnished"
                      className="w-4 h-4 text-green-600"
                      onChange={handleChange}
                      checked={formData.furnished}
                    />
                    <Sofa className="h-4 w-4" />
                    <span className="font-medium">Furnished</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all text-sm ${
                    formData.offer 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="offer"
                      className="w-4 h-4 text-orange-600"
                      onChange={handleChange}
                      checked={formData.offer}
                    />
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">Special Offer</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Pricing & Submit */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Details & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Room Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700">
                    <Bed className="h-3 w-3 inline mr-1" />
                    Bedrooms
                  </Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => handleNumberChange('bedrooms', false)}
                      disabled={formData.bedrooms <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      id="bedrooms"
                      min="1"
                      max="6"
                      className="h-9 text-center rounded-none border-l-0 border-r-0"
                      onChange={handleChange}
                      value={formData.bedrooms}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => handleNumberChange('bedrooms', true)}
                      disabled={formData.bedrooms >= 6}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700">
                    <Bath className="h-3 w-3 inline mr-1" />
                    Bathrooms
                  </Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => handleNumberChange('bathrooms', false)}
                      disabled={formData.bathrooms <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      id="bathrooms"
                      min="1"
                      max="6"
                      className="h-9 text-center rounded-none border-l-0 border-r-0"
                      onChange={handleChange}
                      value={formData.bathrooms}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => handleNumberChange('bathrooms', true)}
                      disabled={formData.bathrooms >= 6}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="regularPrice" className="text-sm font-medium text-gray-700">
                    Regular Price
                  </Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-r-none"
                      onClick={() => handleNumberChange('regularPrice', false)}
                      disabled={formData.regularPrice <= 1000000}
                    >
                      -
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        id="regularPrice"
                        className="h-9 text-sm pl-6 rounded-none border-l-0 border-r-0"
                        onChange={(e) => handlePriceChange(e, 'regularPrice')}
                        value={formatPrice(formData.regularPrice)}
                      />
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-l-none"
                      onClick={() => handleNumberChange('regularPrice', true)}
                      disabled={formData.regularPrice >= 20000000}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {formData.offer && (
                  <div className="space-y-1">
                    <Label htmlFor="discountPrice" className="text-sm font-medium text-gray-700">
                      Discount Price
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        id="discountPrice"
                        className="h-9 text-sm pl-6"
                        onChange={(e) => handlePriceChange(e, 'discountPrice')}
                        value={formatPrice(formData.discountPrice)}
                      />
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-red-700 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-green-700 text-sm flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    {success}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-3 pt-2">
                <Button 
                  disabled={saving} 
                  className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl" 
                  onClick={save}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditListing;