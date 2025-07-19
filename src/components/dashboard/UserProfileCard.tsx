import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface UserProfileCardProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
  };
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'sub_admin': return 'secondary';
      case 'class_teacher': return 'default';
      case 'common_teacher': return 'secondary';
      case 'intern_teacher': return 'outline';
      case 'student': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'sub_admin': return 'Sub Administrator';
      case 'class_teacher': return 'Class Teacher';
      case 'common_teacher': return 'Subject Teacher';
      case 'intern_teacher': return 'Intern Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>
          Your account details and role information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-lg">
              {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
            <Badge variant={getRoleBadgeVariant(profile.role)}>
              {getRoleDisplayName(profile.role)}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          {profile.address && (
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profile.address}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;