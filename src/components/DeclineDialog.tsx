import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reason: string;
  setReason: (val: string) => void;
  isDeclining: boolean;
}

export const DeclineDialog = ({ open, onOpenChange, onConfirm, reason, setReason, isDeclining }: DeclineDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline Request</DialogTitle>
          <DialogDescription>Please provide a reason for rejection.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label>Reason</Label>
          <Textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="e.g. Invalid documents..." 
            className="mt-2" 
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeclining}>
            {isDeclining ? "Declining..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};