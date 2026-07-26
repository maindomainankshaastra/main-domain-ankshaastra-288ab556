// import { ReactNode } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
// import { Loader2 } from "lucide-react";

// interface Props {
//   children: ReactNode;
//   requireAdmin?: boolean;
// }

// const ProtectedRoute = ({ children, requireAdmin }: Props) => {
//   const { user, role, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
//   }

// if (requireAdmin && role !== "admin" && role !== "staff") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;


import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  // Blocks admin/staff accounts from this route, sending them to the
  // Operations Console instead. Used on customer-only pages (e.g. "My
  // Dashboard") so admin/staff can never land there — even via a direct
  // URL, bookmark, or stale link — not just via hidden UI.
  customerOnly?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin, customerOnly }: Props) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && role !== "admin" && role !== "staff") {
    return <Navigate to="/dashboard" replace />;
  }

  if (customerOnly && (role === "admin" || role === "staff")) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;