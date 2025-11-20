import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, Calendar, MapPin, User, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ExitRequestCardProps {
  request: any;
  onVerifyDocs: (id: string, status: boolean) => void;
  onApprove: (request: any) => void;
  onDecline: (request: any) => void;
  onViewQR: (request: any) => void;
}

export const ExitRequestCard = ({
  request,
  onVerifyDocs,
  onApprove,
  onDecline,
  onViewQR
}: ExitRequestCardProps) => {
  return (
    <Card className={request.status === 'declined' ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{request.students?.full_name || "Unknown"}</span>
              <span className="text-sm text-muted-foreground">({request.students?.student_id})</span>
            </div>
            <CardTitle className="text-lg">{request.exit_type?.toUpperCase()} - {request.reason}</CardTitle>
            <CardDescription className="flex items-center mt-1">
                Submitted {format(new Date(request.created_at), "PPp")}
            </CardDescription>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> {request.destination}</div>
            <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-muted-foreground" /> Return: {format(new Date(request.expected_return_date), "PPp")}</div>
          </div>
          
          {/* DOCUMENTS SECTION */}
          {(request.exit_type === 'overnight' || request.leave_absence_url) && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                <p className="font-semibold text-xs mb-2">ATTACHMENTS</p>
                <div className="flex flex-wrap gap-2">
                  {request.parent_letter_url && (
                    <a href={request.parent_letter_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1"/> Parent Letter</Button>
                    </a>
                  )}
                  
                  {request.id_card_url && (
                    <a href={request.id_card_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1"/> ID Card</Button>
                    </a>
                  )}

                  {request.leave_absence_url && (
                     <a href={request.leave_absence_url} target="_blank" rel="noreferrer">
                       <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <FileText className="h-3 w-3 mr-1"/> Leave Form
                       </Button>
                     </a>
                  )}
                </div>

                {request.exit_type === 'overnight' && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                    <Switch 
                      id={`verify-${request.id}`} 
                      checked={request.documents_verified}
                      onCheckedChange={() => onVerifyDocs(request.id, request.documents_verified)}
                      disabled={request.status !== 'pending'}
                    />
                    <Label htmlFor={`verify-${request.id}`} className={request.documents_verified ? "text-green-600 font-medium" : ""}>
                      {request.documents_verified ? "Documents Verified" : "Mark Documents as Verified"}
                    </Label>
                  </div>
                )}
            </div>
          )}
        </div>

        {request.has_classes && request.hod_status !== 'approved' && request.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800 flex items-center">
            <span className="mr-2">⚠️</span> Waiting for Departmental (HOD) Approval first.
          </div>
        )}

        {request.status === "pending" && (!request.has_classes || request.hod_status === 'approved') && (
          <div className="flex space-x-2 pt-2">
            <Button size="sm" onClick={() => onApprove(request)} className="flex-1 bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDecline(request)} className="flex-1">
              <X className="h-4 w-4 mr-1" /> Decline
            </Button>
          </div>
        )}

        {request.status === "approved" && request.qr_code && (
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={() => onViewQR(request)}>View QR Code</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};