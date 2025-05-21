"use client"

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from '../../lib/supabase';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPlans?: string[]; // Optional array of plans that can access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPlans = [] // Default to empty array (no plan requirements)
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(requiredPlans.length > 0);

  useEffect(() => {
    const getUserPlan = async () => {
      // Only check plan if there are plan requirements and user is authenticated
      if (requiredPlans.length > 0 && isAuthenticated && user) {
        try {
          // Fetch the user's subscription plan from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('subscription_plan')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user plan:", error);
            setUserPlan("basic"); // Fallback to basic plan
          } else {
            setUserPlan(data.subscription_plan);
          }
        } catch (error) {
          console.error("Error in plan check:", error);
          setUserPlan("basic"); // Fallback to basic plan
        } finally {
          setCheckingPlan(false);
        }
      } else {
        setCheckingPlan(false);
      }
    };

    getUserPlan();
  }, [isAuthenticated, user, requiredPlans]);

  // Show loading state
  if (loading || checkingPlan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  // If there are plan requirements, check if user has access
  if (requiredPlans.length > 0) {
    // Redirect to features page if plan doesn't have access
    if (!userPlan || !requiredPlans.includes(userPlan)) {
      return <Navigate to="/features" />;
    }
  }

  // User is authenticated and has the required plan (or no plan required)
  return <>{children}</>;
};

export default ProtectedRoute;
