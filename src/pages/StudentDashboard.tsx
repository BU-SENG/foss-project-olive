import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Plus,
  AlertCircle,
  CalendarArrowUp,
  CalendarArrowDown,
  QrCode,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileSection } from "@/components/ProfileSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, eachDayOfInterval, getDay } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    departureDate: "",
    expectedReturnDate: "",
    dayDate: "",
    dayStartTime: "",
    dayEndTime: "",
    exitType: "day",
    hasClasses: false,
    additionalComments: "",
    parentLetter: null as File | null,
    idCard: null as File | null,
    leaveForm: null as File | null,
  });

  const isSchoolDayTrip = () => {
    if (formData.exitType === "day") return false;
    if (!formData.departureDate || !formData.expectedReturnDate) return false;
    const start = new Date(formData.departureDate);
    const end = new Date(formData.expectedReturnDate);
    if (start > end) return false;
    const days = eachDayOfInterval({ start, end });
    return days.some((day) => {
      const dayNum = getDay(day);
      return dayNum >= 1 && dayNum <= 4;
    });
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("exit_requests")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
  };

  const handleFileUpload = async (file: File, path: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    const { error } = await supabase.storage
      .from("exit_docs")
      .upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from("exit_docs").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalDeparture: string;
      let finalReturn: string;

      if (formData.exitType === "day") {
        if (
          !formData.dayDate ||
          !formData.dayStartTime ||
          !formData.dayEndTime
        ) {
          throw new Error(
            "Please select date, departure time, and arrival time."
          );
        }
        finalDeparture = new Date(
          `${formData.dayDate}T${formData.dayStartTime}`
        ).toISOString();
        finalReturn = new Date(
          `${formData.dayDate}T${formData.dayEndTime}`
        ).toISOString();
      } else {
        if (!formData.departureDate || !formData.expectedReturnDate) {
          throw new Error("Please select departure and return dates.");
        }
        finalDeparture = new Date(formData.departureDate).toISOString();
        finalReturn = new Date(formData.expectedReturnDate).toISOString();
      }

      const needsHOD = isSchoolDayTrip();

      if (
        formData.exitType === "overnight" &&
        (!formData.parentLetter || !formData.idCard)
      ) {
        throw new Error(
          "Parent Letter and ID Card are required for overnight exits."
        );
      }

      if (needsHOD && !formData.leaveForm) {
        throw new Error(
          "A signed Leave of Absence Form is required for trips on Mon-Thu."
        );
      }

      let parentLetterUrl = null;
      let idCardUrl = null;
      let leaveFormUrl = null;

      if (formData.parentLetter)
        parentLetterUrl = await handleFileUpload(
          formData.parentLetter,
          "parent_letters"
        );
      if (formData.idCard)
        idCardUrl = await handleFileUpload(formData.idCard, "id_cards");
      if (formData.leaveForm)
        leaveFormUrl = await handleFileUpload(
          formData.leaveForm,
          "leave_forms"
        );

      const hodStatus = needsHOD ? "pending" : "approved";

      const { error } = await supabase.from("exit_requests").insert({
        student_id: user?.id,
        reason: formData.reason,
        destination: formData.destination,
        departure_date: finalDeparture,
        expected_return_date: finalReturn,
        exit_type: formData.exitType as "day" | "overnight",
        has_classes: needsHOD,
        parent_letter_url: parentLetterUrl,
        id_card_url: idCardUrl,
        leave_absence_url: leaveFormUrl,
        additional_comments: formData.additionalComments,
        status: "pending",
        hod_status: hodStatus,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request submitted successfully",
      });
      setIsDialogOpen(false);
      fetchRequests();

      setFormData((prev) => ({
        ...prev,
        reason: "",
        destination: "",
        departureDate: "",
        expectedReturnDate: "",
        dayDate: "",
        dayStartTime: "",
        dayEndTime: "",
        parentLetter: null,
        idCard: null,
        leaveForm: null,
      }));
    } catch (error: any) {
      if (
        error.code === "23505" ||
        error.message?.includes("unique constraint")
      ) {
        toast({
          title: "Active Request Exists",
          description: "You already have an active request.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("exit_requests")
      .delete()
      .eq("id", deleteId);
    if (error)
      toast({
        title: "Error",
        description: "Failed to delete request.",
        variant: "destructive",
      });
    else {
      toast({ title: "Deleted", description: "Request has been removed." });
      fetchRequests();
    }
    setDeleteId(null);
  };

  const needsHOD = isSchoolDayTrip();

  return (
    <DashboardLayout title="Student Dashboard">
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Exit Requests</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Exit Requests</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Request Exit Pass</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exit Type</Label>
                      <Select
                        onValueChange={(v) =>
                          setFormData({ ...formData, exitType: v })
                        }
                        defaultValue="day"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day Pass</SelectItem>
                          <SelectItem value="overnight">
                            Overnight / Weekend
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>

                  {formData.exitType === "day" ? (
                    <div className="space-y-4 bg-muted/20 p-3 rounded-md border">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dayDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Departure Time</Label>
                          <Input
                            type="time"
                            required
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dayStartTime: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Arrival Time</Label>
                          <Input
                            type="time"
                            required
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dayEndTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Departure Date & Time</Label>
                        <Input
                          type="datetime-local"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departureDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Return Date & Time</Label>
                        <Input
                          type="datetime-local"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expectedReturnDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {needsHOD && (
                    <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                      <Label
                        htmlFor="leaveForm"
                        className="font-semibold text-yellow-800"
                      >
                        Upload Leave of Absence Form (Required)
                      </Label>
                      <Input
                        id="leaveForm"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            leaveForm: e.target.files?.[0] || null,
                          })
                        }
                        required
                      />
                    </div>
                  )}

                  {formData.exitType === "overnight" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="parentLetter">Parent Letter</Label>
                        <Input
                          id="parentLetter"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              parentLetter: e.target.files?.[0] || null,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="idCard">Parent ID Card</Label>
                        <Input
                          id="idCard"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              idCard: e.target.files?.[0] || null,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading..." : "Submit Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {requests.map((req) => (
              <Card key={req.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {req.exit_type?.toUpperCase() || "EXIT"} -{" "}
                        {req.destination}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {req.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteId(req.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <StatusBadge status={req.status} />
                      </div>

                      {(req.status === "approved" || req.status === "exited") &&
                        req.qr_code && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedPass(req)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            {req.status === "exited"
                              ? "Return Gate Pass"
                              : "Exit Gate Pass"}
                          </Button>
                        )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center space-x-2 text-sm mb-4 bg-muted/50 p-2 rounded">
                    <div
                      className={
                        req.hod_status === "approved"
                          ? "text-green-600 font-bold"
                          : req.hod_status === "rejected"
                          ? "text-red-600 font-bold"
                          : "text-yellow-600"
                      }
                    >
                      1. HOD: {req.hod_status || "N/A"}
                    </div>
                    <span>→</span>
                    <div
                      className={
                        ["approved", "exited", "returned"].includes(req.status)
                          ? "text-green-600 font-bold"
                          : req.status === "declined"
                          ? "text-red-600 font-bold"
                          : "text-yellow-600"
                      }
                    >
                      2. Hall Admin: {req.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarArrowUp className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        Out:{" "}
                        {req.departure_date
                          ? format(new Date(req.departure_date), "PP p")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CalendarArrowDown className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        In:{" "}
                        {req.expected_return_date
                          ? format(new Date(req.expected_return_date), "PP p")
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold">Reason:</span> {req.reason}
                  </p>

                  {(req.rejection_reason || req.hod_comment) && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-border">
                      {req.hod_comment && (
                        <Alert
                          variant="default"
                          className="bg-yellow-50/50 border-yellow-200"
                        >
                          <MessageSquare className="h-4 w-4 text-yellow-600" />
                          <AlertTitle className="text-yellow-800 text-sm font-semibold">
                            HOD Comment
                          </AlertTitle>
                          <AlertDescription className="text-yellow-700 text-xs">
                            {req.hod_comment}
                          </AlertDescription>
                        </Alert>
                      )}
                      {req.rejection_reason && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="font-semibold">
                            Request Declined
                          </AlertTitle>
                          <AlertDescription>
                            {req.rejection_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this exit request? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog
            open={!!selectedPass}
            onOpenChange={() => setSelectedPass(null)}
          >
            <DialogContent className="sm:max-w-md text-center">
              <DialogHeader>
                <DialogTitle>Exit Pass</DialogTitle>
                <DialogDescription>
                  {selectedPass?.status === "exited"
                    ? "Scan this to return to school."
                    : "Show this QR code to security at the gate."}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                {selectedPass?.qr_code && (
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <QRCodeSVG value={selectedPass.qr_code} size={200} />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-bold text-lg">
                    {selectedPass?.destination}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pass ID: {selectedPass?.qr_code}
                  </p>
                </div>
                <div
                  className={`w-full p-3 rounded-md text-sm font-medium ${
                    selectedPass?.status === "exited"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-50 text-green-800"
                  }`}
                >
                  Status: {selectedPass?.status.toUpperCase()}
                </div>
              </div>
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

export default StudentDashboard;