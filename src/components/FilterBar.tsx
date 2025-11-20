import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  setStatusFilter?: (val: string) => void;
  roleFilter?: string;
  setRoleFilter?: (val: string) => void;
}

export const FilterBar = ({ 
  searchQuery, setSearchQuery, searchPlaceholder = "Search...", 
  statusFilter, setStatusFilter, 
  roleFilter, setRoleFilter 
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 w-full">
      <Input 
        placeholder={searchPlaceholder} 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        className="w-full sm:max-w-sm" 
      />
      
      {statusFilter && setStatusFilter && (
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="exited">Exited</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      )}

      {roleFilter && setRoleFilter && (
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="hall_admin">Hall Admin</SelectItem>
            <SelectItem value="hod">HOD</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};