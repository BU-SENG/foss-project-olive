import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, CalendarArrowUp, CalendarArrowDown, MapPin, User, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ExitRequestCardProps {
  request: any;
  onVerifyDocs: (id: string, status: boolean) => void;
  onApprove: (request: any) => void;
  onDecline: (request: any) => void;
  onViewQR: (request: any) => void;
}

export const ExitRequestCard = ({ request, onVerifyDocs, onApprove, onDecline, onViewQR }: ExitRequestCardProps) => {
  return (
    <Card className={request.status === 'declined' ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
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
        {/* Destination & Dates Grid */}
        <div className="space-y-3">
            <div className="flex items-center text-sm font-medium">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> 
                Destination: {request.destination}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border">
                <div className="flex items-start space-x-3">
                    <CalendarArrowUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Departure</p>
                        <p className="text-sm font-medium">
                            {request.departure_date ? format(new Date(request.departure_date), "PP p") : "N/A"}
                        </p>
                    </div>
                </div>
                <div className="flex items-start space-x-3">
                    <CalendarArrowDown className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Expected Return</p>
                        <p className="text-sm font-medium">
                            {request.expected_return_date ? format(new Date(request.expected_return_date), "PP p") : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
          
        {/* DOCUMENTS SECTION */}
        {(request.exit_type === 'overnight' || request.leave_absence_url) && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                <p className="font-semibold text-xs mb-2">ATTACHMENTS</p>
                <div className="flex flex-wrap gap-2">
                  {request.parent_letter_url && (
                    <a href={request.parent_letter_url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><FileText className="h-3 w-3 mr-1"/> Parent Letter</Button></a>
                  )}
                  {request.id_card_url && (
                    <a href={request.id_card_url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1"/> ID Card</Button></a>
                  )}
                  {request.leave_absence_url && (
                     <a href={request.leave_absence_url} target="_blank" rel="noreferrer"><Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><FileText className="h-3 w-3 mr-1"/> Leave Form</Button></a>
                  )}
                </div>

                {request.exit_type === 'overnight' && (
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                    <Switch checked={request.documents_verified} onCheckedChange={() => onVerifyDocs(request.id, request.documents_verified)} disabled={request.status !== 'pending'} />
                    <Label className={request.documents_verified ? "text-green-600 font-medium" : ""}>{request.documents_verified ? "Verified" : "Verify Docs"}</Label>
                  </div>
                )}
            </div>
        )}

        {request.status === "pending" && (!request.has_classes || request.hod_status === 'approved') && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-end">
            <Button size="sm" variant="destructive" onClick={() => onDecline(request)} className="flex-1 sm:flex-none"><X className="h-4 w-4 mr-1" /> Decline</Button>
            <Button size="sm" onClick={() => onApprove(request)} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-1" /> Approve</Button>
          </div>
        )}

        {request.status === "approved" && request.qr_code && (
          <div className="text-center sm:text-right">
            <Button variant="outline" size="sm" onClick={() => onViewQR(request)}>View QR Code</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};