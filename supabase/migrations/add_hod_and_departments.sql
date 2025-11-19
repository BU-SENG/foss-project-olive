-- 1. Update Enums to include HOD role and Exit Types
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hod';
CREATE TYPE public.exit_type AS ENUM ('day', 'overnight');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create Departments Table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create HODs Table (Departmental Officers)
CREATE TABLE public.hods (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Update Students Table to link to Department
ALTER TABLE public.students 
ADD COLUMN department_id UUID REFERENCES public.departments(id);

-- 5. Update Exit Requests Table with new requirements
ALTER TABLE public.exit_requests 
ADD COLUMN exit_type exit_type DEFAULT 'day',
ADD COLUMN has_classes BOOLEAN DEFAULT false,
ADD COLUMN parent_letter_url TEXT, -- URL to uploaded file
ADD COLUMN id_card_url TEXT,       -- URL to uploaded file
ADD COLUMN documents_verified BOOLEAN DEFAULT false, -- For Hall Admin to check
ADD COLUMN hod_status approval_status DEFAULT 'pending',
ADD COLUMN hod_comment TEXT,
ADD COLUMN rejection_reason TEXT; -- Mandatory reason if rejected

-- 6. Create Audit Logs Table (Non-editable history)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.exit_requests(id),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- e.g., "SUBMITTED", "HOD_APPROVED", "VERIFIED_DOCS"
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Enable RLS for new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (Simplified for brevity)
CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "HODs view own profile" ON public.hods FOR SELECT USING (id = auth.uid());
CREATE POLICY "HODs view requests from their dept" ON public.exit_requests FOR SELECT 
USING (
    has_role(auth.uid(), 'hod') AND 
    EXISTS (
        SELECT 1 FROM public.students s
        JOIN public.hods h ON s.department_id = h.department_id
        WHERE s.id = exit_requests.student_id AND h.id = auth.uid()
    )
);