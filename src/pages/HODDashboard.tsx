import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/ProfileSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarArrowDown, CalendarArrowUp, FileText, ExternalLink, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

const HODDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [declineRequest, setDeclineRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    fetchDeptRequests();
  }, [user, statusFilter]);

  const fetchDeptRequests = async () => {
    if (!user) return;

    let query = supabase
      .from("exit_requests")
      .select(`
        *,
        students:student_id(full_name, student_id)
      `)
      .eq("has_classes", true)
      .order("created_at", { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq("hod_status", statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("exit_requests")
      .update({ 
        hod_status: 'approved',
        // If it was previously declined, we reset the main status to pending so Hall Admin can see it
        status: 'pending', 
        rejection_reason: null 
      })
      .eq("id", id);

    if (!error) {
      toast({ title: "Request Approved", description: "Sent to Hall Admin for final verification." });
      fetchDeptRequests();
    } else {
      toast({ title: "Error", description: "Failed to approve request.", variant: "destructive" });
    }
  };

  const submitDecline = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }
    
    setIsDeclining(true);
    const { error } = await supabase
      .from("exit_requests")
      .update({ 
        hod_status: 'rejected',
        status: 'declined',
        rejection_reason: rejectionReason,
        hod_comment: rejectionReason
      })
      .eq("id", declineRequest.id);

    setIsDeclining(false);
    
    if (!error) {
      toast({ title: "Request Declined", description: "The student has been notified." });
      setDeclineRequest(null);
      setRejectionReason("");
      fetchDeptRequests();
    } else {
      toast({ title: "Error", description: "Failed to decline request", variant: "destructive" });
    }
  };

  if (loading) {
    return <DashboardLayout title="Department"><div className="p-12 text-center">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Departmental Officer">
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Review Requests</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Class Conflict Reviews</h3>
              <p className="text-sm text-muted-foreground">Approve or decline requests that conflict with lectures.</p>
            </div>
            
            {/* Filter to allow seeing old/rejected requests */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {requests.length === 0 ? (
              <Card><CardContent className="pt-6 text-center py-12"><p className="text-muted-foreground">No requests found.</p></CardContent></Card>
            ) : (
              requests.map(req => (
                <Card key={req.id} className={req.hod_status === 'rejected' ? "border-red-200 bg-red-50/30" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">{req.students?.full_name}</CardTitle>
                            <span className="text-sm text-muted-foreground">({req.students?.student_id})</span>
                          </div>
                          <CardDescription>{req.exit_type?.toUpperCase()} Request</CardDescription>
                       </div>
                       {/* Custom Badge for HOD Status */}
                       <div className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                         req.hod_status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                         req.hod_status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                         'bg-yellow-100 text-yellow-800 border-yellow-200'
                       }`}>
                         HOD: {req.hod_status?.toUpperCase()}
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Reason & Destination */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Reason</p>
                        <p className="text-sm">{req.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Destination</p>
                        <div className="flex items-center text-sm"><MapPin className="h-3 w-3 mr-1"/> {req.destination}</div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                       <div className="flex items-center text-sm">
                          <CalendarArrowUp className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <span className="block text-xs text-muted-foreground">Departure</span>
                            <span className="font-medium">{req.departure_date ? format(new Date(req.departure_date), "PP p") : "N/A"}</span>
                          </div>
                       </div>
                       <div className="flex items-center text-sm">
                          <CalendarArrowDown className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <span className="block text-xs text-muted-foreground">Expected Return</span>
                            <span className="font-medium">{req.expected_return_date ? format(new Date(req.expected_return_date), "PP p") : "N/A"}</span>
                          </div>
                       </div>
                    </div>

                    {/* Documents (If Overnight) */}
                    {req.exit_type === 'overnight' && (
                      <div className="flex gap-3 pt-2">
                        {req.parent_letter_url ? (
                          <a href={req.parent_letter_url} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="h-8"><FileText className="h-3 w-3 mr-2"/> Parent Letter</Button>
                          </a>
                        ) : <span className="text-xs text-red-500 italic flex items-center">No Parent Letter</span>}
                        
                        {req.id_card_url ? (
                          <a href={req.id_card_url} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="h-8"><ExternalLink className="h-3 w-3 mr-2"/> ID Card</Button>
                          </a>
                        ) : <span className="text-xs text-red-500 italic flex items-center">No ID Card</span>}

                        {req.leave_absence_url && (
                          <a href={req.leave_absence_url} target="_blank" rel="noreferrer">
                            <Button variant="default" size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                              <FileText className="h-3 w-3 mr-2"/> Leave of Absence Form
                            </Button>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Rejection Reason Display (if rejected) */}
                    {req.hod_status === 'rejected' && req.rejection_reason && (
                      <div className="bg-red-100 p-3 rounded text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {req.rejection_reason}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                      {/* Show Decline if not already rejected */}
                      {req.hod_status !== 'rejected' && (
                        <Button variant="destructive" size="sm" onClick={() => setDeclineRequest(req)}>
                          Decline
                        </Button>
                      )}
                      
                      {/* Show Approve if Pending OR Rejected (Allows re-approval) */}
                      {(req.hod_status === 'pending' || req.hod_status === 'rejected') && (
                        <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700">
                          {req.hod_status === 'rejected' ? "Re-Approve" : "Approve"}
                        </Button>
                      )}
                    </div>

                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Decline Dialog */}
          <Dialog open={!!declineRequest} onOpenChange={(open) => { if(!open) setDeclineRequest(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Decline Request</DialogTitle>
                <DialogDescription>
                  Please provide a comment for the student explaining why this request is being rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Reason for Rejection</Label>
                <Textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., You have a test on this date."
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeclineRequest(null)}>Cancel</Button>
                <Button variant="destructive" onClick={submitDecline} disabled={isDeclining}>
                  {isDeclining ? "Declining..." : "Confirm Rejection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </TabsContent>

        <TabsContent value="profile">
          {user && <ProfileSection user={user} />}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default HODDashboard;