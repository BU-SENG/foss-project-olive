import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration State
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [hallId, setHallId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [level, setLevel] = useState("");

  // Data Lists
  const [halls, setHalls] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: h } = await supabase.from("halls").select("id, name").order("name");
      if (h) setHalls(h);
      const { data: d } = await supabase.from("departments").select("id, name").order("name");
      if (d) setDepartments(d);
    };
    fetchData();
  }, []);

  // --- PASSWORD VALIDATOR ---
  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!regex.test(pwd)) {
      return "Password must be at least 8 characters long and include: 1 Uppercase, 1 Number, and 1 Special Character.";
    }
    return null;
  };

  // --- EMAIL VALIDATOR ---
  const validateStudentEmail = (email: string) => {
    if (!email.endsWith("@student.babcock.edu.ng")) {
      return "Please use your valid student email (@student.babcock.edu.ng).";
    }
    return null;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    } else {
      // SUCCESS: No timeout, no artificial loading screen. Just go.
      toast({ title: "Welcome back!", description: "Successfully signed in." });
      navigate("/dashboard"); 
    }
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Email Domain
    const emailError = validateStudentEmail(regEmail);
    if (emailError) {
      toast({ title: "Invalid Email", description: emailError, variant: "destructive" });
      return;
    }

    // 2. Validate Password Strength
    const pwdError = validatePassword(regPassword);
    if (pwdError) {
      toast({ title: "Weak Password", description: pwdError, variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (!hallId || !deptId || !level) throw new Error("Please fill in all details.");

      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: 'student',
            hall_id: hallId,
            department_id: deptId,
            level: level
          },
        },
      });

      if (error) throw error;

      toast({ title: "Success!", description: "Account created. Please check your email to confirm before signing in." });
      
      // Switch to Sign In tab automatically
      setEmail(regEmail);
      
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CEMS Portal</CardTitle>
          <CardDescription>Babcock University Exit Management</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Student Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleStudentSignUp} className="space-y-3">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Institutional Email</Label>
                  <Input 
                    type="email" 
                    value={regEmail} 
                    onChange={(e) => setRegEmail(e.target.value)} 
                    placeholder="example@student.babcock.edu.ng"
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input 
                      type={showRegPassword ? "text" : "password"} 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)} 
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">8+ chars, 1 Uppercase, 1 Number, 1 Special Character</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Hall of Residence</Label>
                    <Select onValueChange={setHallId} required>
                      <SelectTrigger><SelectValue placeholder="Select Hall" /></SelectTrigger>
                      <SelectContent>
                        {halls.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                     <Label>Level</Label>
                     <Select onValueChange={setLevel} required>
                      <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                      <SelectContent>
                        {['100', '200', '300', '400', '500', '600'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select onValueChange={setDeptId} required>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Student Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;