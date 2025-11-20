import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileCheck, UserCheck, Clock, User } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/StatsCard";
import { FilterBar } from "@/components/FilterBar";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, totalRequests: 0, pendingRequests: 0, approvedRequests: 0 });
  const [requests, setRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newOfficial, setNewOfficial] = useState({ fullName: "", email: "", password: "CEMS@2025", role: "hall_admin", hallId: "", deptId: "" });
  const [halls, setHalls] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchStats(); fetchAllRequests(); fetchAllUsers(); fetchOptions(); }, []);

  // ... (Fetch functions identical to previous, keeping them for brevity) ...
  const fetchStats = async () => {
    const { count: s } = await supabase.from("students").select("*", { count: "exact", head: true });
    const { count: h } = await supabase.from("hall_admins").select("*", { count: "exact", head: true });
    const { count: ho } = await supabase.from("hods").select("*", { count: "exact", head: true });
    const { count: sec } = await supabase.from("security_personnel").select("*", { count: "exact", head: true });
    const { count: sa } = await supabase.from("super_admins").select("*", { count: "exact", head: true });
    const { count: req } = await supabase.from("exit_requests").select("*", { count: "exact", head: true });
    const { count: pen } = await supabase.from("exit_requests").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { count: app } = await supabase.from("exit_requests").select("*", { count: "exact", head: true }).eq("status", "approved");
    setStats({ totalUsers: (s||0)+(h||0)+(ho||0)+(sec||0)+(sa||0), totalRequests: req||0, pendingRequests: pen||0, approvedRequests: app||0 });
  };

  const fetchAllRequests = async () => {
    const { data } = await supabase.from("exit_requests").select(`*, students:student_id (full_name)`).order("created_at", { ascending: false });
    if (data) setRequests(data);
  };

  const fetchAllUsers = async () => {
    // ... (Same as previous code for fetching all roles) ...
    const users = [];
    const { data: s } = await supabase.from("students").select("*, halls (name)"); if (s) users.push(...s.map(x => ({ ...x, role: "student" })));
    const { data: h } = await supabase.from("hall_admins").select("*, halls (name)"); if (h) users.push(...h.map(x => ({ ...x, role: "hall_admin" })));
    const { data: ho } = await supabase.from("hods").select("*, departments (name)"); if (ho) users.push(...ho.map(x => ({ ...x, role: "hod" })));
    const { data: sec } = await supabase.from("security_personnel").select("*"); if (sec) users.push(...sec.map(x => ({ ...x, role: "security" })));
    const { data: sa } = await supabase.from("super_admins").select("*"); if (sa) users.push(...sa.map(x => ({ ...x, role: "super_admin" })));
    setAllUsers(users);
  };

  const fetchOptions = async () => {
    const { data: h } = await supabase.from("halls").select("id, name");
    const { data: d } = await supabase.from("departments").select("id, name");
    if (h) setHalls(h); if (d) setDepts(d);
  };

  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      const { error } = await supabase.functions.invoke('create-official', { body: newOfficial });
      if (error) throw error;
      toast({ title: "Success", description: `User ${newOfficial.email} created.` });
      fetchAllUsers(); fetchStats();
    } catch (error: any) { toast({ title: "Failed", description: error.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const filteredReqs = requests.filter(r => 
    (statusFilter === "all" || r.status === statusFilter) && 
    (r.students?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.destination?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = allUsers.filter(u => 
    (roleFilter === "all" || u.role === roleFilter)
  );

  return (
    <DashboardLayout title="Super Admin">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="create-user">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
           <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
           <StatsCard title="Total Requests" value={stats.totalRequests} icon={FileCheck} />
           <StatsCard title="Pending" value={stats.pendingRequests} icon={Clock} iconColor="text-yellow-500" />
           <StatsCard title="Approved" value={stats.approvedRequests} icon={UserCheck} iconColor="text-green-500" />
        </TabsContent>

        <TabsContent value="requests">
          <FilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
          <div className="grid gap-4 grid-cols-1">
            {filteredReqs.map(r => (
              <Card key={r.id}>
                <CardHeader className="p-4"><CardTitle className="text-base">{r.reason}</CardTitle><CardDescription>{r.students?.full_name}</CardDescription></CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users">
           <FilterBar searchQuery="" setSearchQuery={() => {}} roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
           <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
             {filteredUsers.map(u => (
               <Card key={`${u.role}-${u.id}`}>
                 <CardHeader className="p-4 flex flex-row items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary"/></div>
                    <div><CardTitle className="text-base">{u.full_name}</CardTitle><CardDescription className="capitalize">{u.role.replace('_', ' ')}</CardDescription></div>
                 </CardHeader>
                 <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                    {u.halls?.name && <p>Hall: {u.halls.name}</p>}
                    {u.departments?.name && <p>Dept: {u.departments.name}</p>}
                    <p className="text-xs mt-1">{u.email}</p>
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>

        <TabsContent value="create-user">
          <Card><CardHeader><CardTitle>Create Official</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOfficial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input value={newOfficial.fullName} onChange={e => setNewOfficial({...newOfficial, fullName: e.target.value})} required /></div>
                  <div><Label>Email</Label><Input type="email" value={newOfficial.email} onChange={e => setNewOfficial({...newOfficial, email: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Password</Label><Input value={newOfficial.password} onChange={e => setNewOfficial({...newOfficial, password: e.target.value})} required /></div>
                  <div><Label>Role</Label>
                    <Select value={newOfficial.role} onValueChange={v => setNewOfficial({...newOfficial, role: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="hall_admin">Hall Admin</SelectItem><SelectItem value="hod">HOD</SelectItem><SelectItem value="security">Security</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                {newOfficial.role === 'hall_admin' && (<div><Label>Hall</Label><Select value={newOfficial.hallId} onValueChange={v => setNewOfficial({...newOfficial, hallId: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{halls.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent></Select></div>)}
                {newOfficial.role === 'hod' && (<div><Label>Department</Label><Select value={newOfficial.deptId} onValueChange={v => setNewOfficial({...newOfficial, deptId: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{depts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>)}
                <Button type="submit" disabled={creating} className="w-full">Create Account</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">{user && <ProfileSection user={user} />}</TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;