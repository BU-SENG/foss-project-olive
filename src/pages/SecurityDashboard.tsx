import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { ProfileSection } from "@/components/ProfileSection";
import { Search, CheckCircle, User, Calendar, MapPin, LogOut, LogIn, Phone } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SecurityDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passId, setPassId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recentExits, setRecentExits] = useState<any[]>([]);
  
  // Dialog States
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  useEffect(() => {
    fetchRecentExits();
  }, []);

  const fetchRecentExits = async () => {
    // Updated to fetch phone_number so clicking a recent item has full details
    const { data, error } = await supabase
      .from("exit_requests")
      .select(`
        *,
        students:student_id (full_name, student_id, phone_number)
      `)
      .in("status", ["exited", "returned", "approved"]) // Added approved to see recent approvals too if needed
      .order("updated_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentExits(data);
    }
  };

  const handleViewDetails = (exit: any) => {
    setSearchResult(exit);
    setPassId(exit.qr_code || "");
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the details
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passId.trim()) return;

    setLoading(true);
    // Reset dialogs
    setShowExitDialog(false);
    setShowReturnDialog(false);

    const { data, error } = await supabase
      .from("exit_requests")
      .select(`
        *,
        students:student_id (full_name, student_id, phone_number)
      `)
      .eq("qr_code", passId.trim())
      .single();

    if (!error && data) {
      setSearchResult(data);
      
      // AUTO-TRIGGER LOGIC
      if (data.status === "approved") {
        toast({ title: "Pass Approved", description: "Please confirm student exit." });
        setShowExitDialog(true);
      } 
      else if (data.status === "exited") {
        toast({ title: "Student Returning", description: "Please confirm student return." });
        setShowReturnDialog(true);
      }
      else if (data.status === "returned") {
        toast({
          title: "Pass Closed",
          description: "This student has already returned.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid Pass",
          description: `Status is ${data.status}. Cannot process at gate.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Pass Not Found",
        description: "No exit pass found with this ID.",
        variant: "destructive",
      });
      setSearchResult(null);
    }
    setLoading(false);
  };

  const handleMarkExited = async () => {
    if (!searchResult) return;

    const { error } = await supabase
      .from("exit_requests")
      .update({
        status: "exited",
        updated_at: new Date().toISOString(),
      })
      .eq("id", searchResult.id);

    if (!error) {
      toast({
        title: "Logged: Left School",
        description: "Student exit recorded successfully.",
      });
      setSearchResult({ ...searchResult, status: "exited" });
      setShowExitDialog(false);
      setPassId(""); 
      fetchRecentExits();
    } else {
      toast({
        title: "Error",
        description: "Failed to record exit",
        variant: "destructive",
      });
    }
  };

  const handleMarkReturned = async () => {
    if (!searchResult) return;

    const { error } = await supabase
      .from("exit_requests")
      .update({
        status: "returned",
        actual_return_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", searchResult.id);

    if (!error) {
      toast({
        title: "Logged: Back in School",
        description: "Student return recorded successfully.",
      });
      setSearchResult({ ...searchResult, status: "returned" });
      setShowReturnDialog(false);
      setPassId(""); 
      fetchRecentExits();
    } else {
      toast({
        title: "Error",
        description: "Failed to record return",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Security Officer">
      <Tabs defaultValue="verify" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verify">Verify Passes</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify Exit Pass</CardTitle>
              <CardDescription>
                Scan QR code or click a recent student below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passId">Pass ID / QR Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="passId"
                      placeholder="Click here and scan QR code"
                      value={passId}
                      onChange={(e) => setPassId(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="submit" disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Scan
                    </Button>
                  </div>
                </div>
              </form>

              {searchResult && (
                <div className="mt-6 p-6 border rounded-lg space-y-6 bg-card shadow-sm animate-in fade-in-50">
                  {/* Student Details Header */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">
                          {searchResult.students?.full_name || "Unknown Student"}
                        </h3>
                        <p className="text-muted-foreground font-mono">
                          {searchResult.students?.student_id}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={searchResult.status} />
                  </div>

                  {/* Trip Details */}
                  <div className="grid md:grid-cols-2 gap-4 py-2">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Destination:</span>
                        <span className="ml-2">{searchResult.destination}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Reason:</span>
                        <span className="ml-2">{searchResult.reason}</span>
                      </div>
                      {searchResult.students?.phone_number && (
                         <div className="flex items-center text-sm">
                           <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                           <span className="font-medium">Phone:</span>
                           <span className="ml-2">{searchResult.students.phone_number}</span>
                         </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Expected Return:</span>
                        <span className="ml-2">
                          {format(new Date(searchResult.expected_return_date), "PPp")}
                        </span>
                      </div>
                      {searchResult.exit_type && (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {searchResult.exit_type.toUpperCase()} PASS
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS WITH CONFIRMATION DIALOGS */}
                  <div className="pt-2">
                    {searchResult.status === "approved" && (
                      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg">
                            <LogOut className="h-5 w-5 mr-2" />
                            Log Student Exit (Left School)
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Exit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark <strong>{searchResult.students?.full_name}</strong> as having LEFT the school premises?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMarkExited}>Confirm Exit</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {searchResult.status === "exited" && (
                      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                            <LogIn className="h-5 w-5 mr-2" />
                            Log Student Return (Back in School)
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Return</AlertDialogTitle>
                            <AlertDialogDescription>
                              Has <strong>{searchResult.students?.full_name}</strong> returned to the school premises? This will close the exit pass.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleMarkReturned}>Confirm Return</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {searchResult.status === "returned" && (
                      <div className="p-4 bg-green-100 border border-green-200 rounded-md text-center text-green-800 font-bold text-lg">
                        ✅ STUDENT IS BACK IN SCHOOL
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Gate Activity</CardTitle>
              <CardDescription>Click on a student to view details or update status.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExits.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentExits.map((exit) => (
                    <div
                      key={exit.id}
                      onClick={() => handleViewDetails(exit)}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${exit.status === 'exited' ? 'bg-orange-100' : 'bg-green-100'}`}>
                          {exit.status === 'exited' ? <LogOut className="h-4 w-4 text-orange-600" /> : <LogIn className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {exit.students?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exit.destination}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={exit.status} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(exit.updated_at), "p")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          {user && <ProfileSection user={user} />}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SecurityDashboard;