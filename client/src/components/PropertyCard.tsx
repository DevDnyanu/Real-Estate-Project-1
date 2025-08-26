import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Phone, Eye, Heart, Star, Crown, Award, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: string;
    rentPrice?: string;
    type: 'sale' | 'rent';
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    image: string;
    sellerPackage?: 'basic' | 'silver' | 'gold' | 'premium';
    featured?: boolean;
    verified?: boolean;
    userRef?: string; // Add userRef to check ownership
  };
  onContact?: () => void;
  onView?: () => void;
  onFavorite?: () => void;
  showEditButton?: boolean; // Add prop to show edit button
  onEdit?: () => void; // Add edit callback
}

const PackageIcon = ({ packageType }: { packageType?: string }) => {
  switch (packageType) {
    case 'premium':
      return <Crown className="w-4 h-4 text-premium" />;
    case 'gold':
      return <Award className="w-4 h-4 text-gold" />;
    case 'silver':
      return <Star className="w-4 h-4 text-silver" />;
    default:
      return null;
  }
};

export const PropertyCard = ({ 
  property, 
  onContact, 
  onView, 
  onFavorite, 
  showEditButton = false,
  onEdit 
}: PropertyCardProps) => {
  const navigate = useNavigate();
  const hasPackage = property.sellerPackage && property.sellerPackage !== 'basic';
  const currentUserId = localStorage.getItem('userId'); // Get current user ID

  const getPackageGradient = () => {
    switch (property.sellerPackage) {
      case 'premium':
        return 'bg-gradient-premium';
      case 'gold':
        return 'bg-gradient-gold';
      case 'silver':
        return 'bg-gradient-silver';
      default:
        return 'bg-gradient-to-r from-muted to-muted';
    }
  };

  const getPackageText = () => {
    switch (property.sellerPackage) {
      case 'premium':
        return 'Premium';
      case 'gold':
        return 'Gold';
      case 'silver':
        return 'Silver';
      default:
        return 'Basic Info Only';
    }
  };

  // Function to handle edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/edit/${property.id}`);
    }
  };

  // Check if current user is the owner of the listing
  const isOwner = property.userRef === currentUserId;

  return (
    <Card className="group overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <Badge className={`${property.type === 'sale' ? 'bg-success' : 'bg-primary'} text-white`}>
            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
          
          {property.featured && (
            <Badge className="bg-gradient-gold text-gold-foreground">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          
          {property.verified && (
            <Badge className="bg-gradient-hero text-primary-foreground">
              Verified
            </Badge>
          )}
        </div>

        {/* Package Badge */}
        {property.sellerPackage && (
          <div className="absolute top-3 right-3">
            <Badge className={`${getPackageGradient()} text-white flex items-center space-x-1`}>
              <PackageIcon packageType={property.sellerPackage} />
              <span>{getPackageText()}</span>
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          {/* Edit Button (only show if user is owner) */}
          {isOwner && (showEditButton || onEdit) && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/80 hover:bg-white text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onFavorite}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Location */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-primary">
            {property.price}
          </div>
          {property.rentPrice && (
            <div className="text-sm text-muted-foreground">
              {property.rentPrice}/month
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} Bedrooms</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms} Bathrooms</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="w-4 h-4" />
            <span>{property.area} sq ft</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={onView}
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Button>
          
          {hasPackage ? (
            <Button 
              size="sm" 
              className={`flex-1 flex items-center justify-center space-x-2 ${getPackageGradient()} text-white`}
              onClick={onContact}
            >
              <Phone className="w-4 h-4" />
              <span>Contact Seller</span>
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 opacity-50 cursor-not-allowed"
              disabled
            >
              <span>Basic Info Only</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};