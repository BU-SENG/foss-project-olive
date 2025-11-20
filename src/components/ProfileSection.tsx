import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Hall {
  id: string;
  name: string;
}

interface ProfileSectionProps {
  user: User;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { role } = useUserRole(user.id);
  const [fullName, setFullName] = useState("");
  const [userIdField, setUserIdField] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hallId, setHallId] = useState("");
  const [halls, setHalls] = useState<Hall[]>([]);
  
  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (role) {
      fetchProfile();
      if (role === "student" || role === "hall_admin") {
        fetchHalls();
      }
    }
  }, [user.id, role]);

  const getTableName = () => {
    switch (role) {
      case "student": return "students";
      case "hall_admin": return "hall_admins";
      case "security": return "security_personnel";
      case "super_admin": return "super_admins";
      case "hod": return "hods"; // Added HOD support
      default: return null;
    }
  };

  const getUserIdFieldName = () => {
    switch (role) {
      case "student": return "student_id";
      case "hall_admin": return "hall_admin_id";
      case "security": return "security_id";
      default: return null;
    }
  };

  const fetchProfile = async () => {
    const tableName = getTableName();
    if (!tableName) return;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setFullName(data.full_name || "");
      if ('phone_number' in data) setPhoneNumber(data.phone_number || "");
      if ('hall_id' in data) setHallId(data.hall_id || "");
      
      const idField = getUserIdFieldName();
      if (idField && idField in data) {
        setUserIdField(data[idField as keyof typeof data] as string || "");
      }
    }
  };

  const fetchHalls = async () => {
    const { data, error } = await supabase.from("halls").select("id, name").order("name");
    if (!error) setHalls(data || []);
  };

  const handleUpdateProfile = async () => {
    const tableName = getTableName();
    if (!tableName) return;

    setLoading(true);
    
    const updateData: any = {
      full_name: fullName,
      phone_number: phoneNumber,
    };

    if (role === "student" && hallId) {
      updateData.hall_id = hallId;
    }

    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated successfully" });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const getIdLabel = () => {
    switch (role) {
      case "student": return "Student ID";
      case "hall_admin": return "Hall Admin ID";
      case "security": return "Security ID";
      default: return "User ID";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
          </div>
          {role !== "super_admin" && (
            <div>
              <Label htmlFor="userId">{getIdLabel()}</Label>
              <Input id="userId" value={userIdField} disabled placeholder="Auto-generated" />
            </div>
          )}
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter your phone number" />
          </div>
          {(role === "student" || role === "hall_admin") && (
            <div>
              <Label htmlFor="hall">Hall</Label>
              <Select value={hallId} onValueChange={setHallId} disabled={role === "hall_admin"}>
                <SelectTrigger><SelectValue placeholder="Select your hall" /></SelectTrigger>
                <SelectContent>
                  {halls.map((hall) => (
                    <SelectItem key={hall.id} value={hall.id}>{hall.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === "hall_admin" && (
                <p className="text-xs text-muted-foreground mt-1">Hall assignment cannot be changed</p>
              )}
            </div>
          )}
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type={newPassword ? "text" : "password"}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm new password"
            />
          </div>
          <Button variant="outline" onClick={handlePasswordChange} disabled={loading || !newPassword}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};