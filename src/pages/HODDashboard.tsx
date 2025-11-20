import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/ProfileSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarArrowDown, CalendarArrowUp, FileText, ExternalLink, User, MapPin } from "lucide-react";
import { format } from "date-fns";

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
      .select(`*, students:student_id(full_name, student_id)`)
      .eq("has_classes", true)
      .order("created_at", { ascending: false });

    if (statusFilter !== 'all') {
      // Fixed: Type assertion added
      query = query.eq("hod_status", statusFilter as any);
    }
    const { data, error } = await query;
    if (!error && data) setRequests(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("exit_requests").update({ hod_status: 'approved', status: 'pending', rejection_reason: null }).eq("id", id);
    if (!error) { toast({ title: "Approved", description: "Sent to Hall Admin." }); fetchDeptRequests(); }
  };

  const submitDecline = async () => {
    if (!rejectionReason.trim()) return toast({ title: "Error", description: "Reason required.", variant: "destructive" });
    setIsDeclining(true);
    const { error } = await supabase.from("exit_requests").update({ hod_status: 'rejected', status: 'declined', rejection_reason: rejectionReason, hod_comment: rejectionReason }).eq("id", declineRequest.id);
    setIsDeclining(false);
    if (!error) { toast({ title: "Declined", description: "Student notified." }); setDeclineRequest(null); setRejectionReason(""); fetchDeptRequests(); }
  };

  if (loading) return <DashboardLayout title="Department"><div className="p-12 text-center">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Departmental Officer">
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Review Requests</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Class Conflict Reviews</h3>
              <p className="text-sm text-muted-foreground">Approve or decline requests.</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {requests.map(req => (
              <Card key={req.id} className={req.hod_status === 'rejected' ? "border-red-200 bg-red-50/30" : "flex flex-col"}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                           <CardTitle className="text-lg">{req.students?.full_name}</CardTitle>
                           <p className="text-xs text-muted-foreground">{req.students?.student_id}</p>
                        </div>
                     </div>
                     <div className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${req.hod_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                       {req.hod_status?.toUpperCase()}
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="font-medium text-muted-foreground">Reason</p><p>{req.reason}</p></div>
                    <div><p className="font-medium text-muted-foreground">Destination</p><div className="flex items-center"><MapPin className="h-3 w-3 mr-1"/> {req.destination}</div></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border">
                     <div className="flex items-start space-x-2">
                        <CalendarArrowUp className="h-4 w-4 mt-0.5 text-blue-500" />
                        <div>
                          <span className="block text-xs text-muted-foreground font-semibold">DEPARTURE</span>
                          <span className="text-sm">{req.departure_date ? format(new Date(req.departure_date), "PP p") : "N/A"}</span>
                        </div>
                     </div>
                     <div className="flex items-start space-x-2">
                        <CalendarArrowDown className="h-4 w-4 mt-0.5 text-green-500" />
                        <div>
                          <span className="block text-xs text-muted-foreground font-semibold">RETURN</span>
                          <span className="text-sm">{req.expected_return_date ? format(new Date(req.expected_return_date), "PP p") : "N/A"}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {req.leave_absence_url && <a href={req.leave_absence_url} target="_blank" rel="noreferrer"><Button variant="default" size="sm" className="bg-blue-600 text-white h-8 text-xs"><FileText className="h-3 w-3 mr-2"/> Leave Form</Button></a>}
                    {req.parent_letter_url && <a href={req.parent_letter_url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="h-8 text-xs"><FileText className="h-3 w-3 mr-2"/> Letter</Button></a>}
                    {req.id_card_url && <a href={req.id_card_url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="h-8 text-xs"><ExternalLink className="h-3 w-3 mr-2"/> ID Card</Button></a>}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    {req.hod_status !== 'rejected' && <Button variant="destructive" size="sm" onClick={() => setDeclineRequest(req)}>Decline</Button>}
                    {(req.hod_status === 'pending' || req.hod_status === 'rejected') && <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700">{req.hod_status === 'rejected' ? "Re-Approve" : "Approve"}</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={!!declineRequest} onOpenChange={(open) => { if(!open) setDeclineRequest(null); }}>
            <DialogContent>
              <DialogHeader><DialogTitle>Decline Request</DialogTitle><DialogDescription>Provide reason.</DialogDescription></DialogHeader>
              <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason..." />
              {/* Fixed: Added disabled state usage */}
              <DialogFooter><Button onClick={submitDecline} disabled={isDeclining}>{isDeclining ? "Processing..." : "Confirm"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="profile">{user && <ProfileSection user={user} />}</TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default HODDashboard;