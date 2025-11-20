import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileSection } from "@/components/ProfileSection";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeSVG } from "qrcode.react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExitRequestCard } from "@/components/ExitRequestCard";

const HallAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  
  const [qrRequest, setQrRequest] = useState<any>(null);
  const [declineRequest, setDeclineRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    let query = supabase
      .from("exit_requests")
      .select(`*, students:student_id (full_name, student_id)`)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      // Fixed: Type assertion added
      query = query.eq("status", statusFilter as any);
    }

    const { data, error } = await query;
    if (!error && data) setRequests(data);
    setLoading(false);
  };

  const handleVerifyDocs = async (requestId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("exit_requests").update({ documents_verified: !currentStatus }).eq("id", requestId);
    if (error) toast({ title: "Error", description: "Failed to update verification", variant: "destructive" });
    else fetchRequests();
  };

  const handleApprove = async (request: any) => {
    if (request.exit_type === 'overnight' && !request.documents_verified) {
      toast({ title: "Verification Required", description: "Verify documents first.", variant: "destructive" });
      return;
    }

    const shortCode = `CEMS-${request.id.substring(0, 8).toUpperCase()}`;
    const { error } = await supabase.from("exit_requests").update({
        status: "approved",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        qr_code: shortCode,
      }).eq("id", request.id);

    if (!error) {
      toast({ title: "Request Approved", description: `Pass generated: ${shortCode}` });
      fetchRequests();
    } else {
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    }
  };

  const submitDecline = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason.", variant: "destructive" });
      return;
    }
    setIsDeclining(true);
    const { error } = await supabase.from("exit_requests").update({
        status: "declined",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      }).eq("id", declineRequest.id);

    setIsDeclining(false);
    if (!error) {
      toast({ title: "Request Declined", description: "Student notified." });
      setDeclineRequest(null);
      setRejectionReason("");
      fetchRequests();
    }
  };

  if (loading) return <DashboardLayout title="Hall Administrator"><div className="text-center py-12">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Hall Administrator">
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Exit Requests</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">Request Management</h3>
              <p className="text-muted-foreground text-sm">Review pending requests or view history.</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="exited">Exited (Out)</SelectItem>
                <SelectItem value="returned">Returned (History)</SelectItem>
                <SelectItem value="all">All Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {requests.length === 0 ? (
              <Card><CardContent className="pt-6 text-center py-12"><p className="text-muted-foreground">No {statusFilter} requests found.</p></CardContent></Card>
            ) : (
              requests.map((request) => (
                <ExitRequestCard 
                  key={request.id}
                  request={request}
                  onVerifyDocs={handleVerifyDocs}
                  onApprove={handleApprove}
                  onDecline={setDeclineRequest}
                  onViewQR={setQrRequest}
                />
              ))
            )}
          </div>

          <Dialog open={!!qrRequest} onOpenChange={() => setQrRequest(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exit Pass QR</DialogTitle>
                <DialogDescription>{qrRequest?.students?.full_name} - {qrRequest?.destination}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                {qrRequest?.qr_code && <QRCodeSVG value={qrRequest.qr_code} size={200} />}
                <p className="text-lg font-bold tracking-widest text-primary">{qrRequest?.qr_code}</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!declineRequest} onOpenChange={(open) => { if(!open) setDeclineRequest(null); }}>
            <DialogContent>
              <DialogHeader><DialogTitle>Decline Request</DialogTitle><DialogDescription>Reason for rejection.</DialogDescription></DialogHeader>
              <div className="py-4">
                <Label>Rejection Reason</Label>
                <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Invalid documents..." className="mt-2" />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeclineRequest(null)}>Cancel</Button>
                <Button variant="destructive" onClick={submitDecline} disabled={isDeclining}>{isDeclining ? "Declining..." : "Confirm"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="profile">{user && <ProfileSection user={user} />}</TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default HallAdminDashboard;