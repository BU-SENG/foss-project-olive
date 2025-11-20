import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
}

export const QRCodeDialog = ({ open, onOpenChange, data }: QRCodeDialogProps) => {
  if (!data) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Exit Pass</DialogTitle>
          <DialogDescription>
            {data.status === 'exited' ? "Scan this to return to school." : "Show this QR code to security."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {data.qr_code && (
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <QRCodeSVG value={data.qr_code} size={200} />
            </div>
          )}
          <div className="space-y-1">
            <p className="font-bold text-lg break-words">{data.destination}</p>
            <p className="text-sm text-muted-foreground font-mono">{data.qr_code}</p>
          </div>
          <div className={`w-full p-3 rounded-md text-sm font-medium ${data.status === 'exited' ? 'bg-orange-100 text-orange-800' : 'bg-green-50 text-green-800'}`}>
            Status: {data.status?.toUpperCase()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};