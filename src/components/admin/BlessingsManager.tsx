import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export const BlessingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blessings, isLoading } = useQuery({
    queryKey: ["admin-blessings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blessings")
        .select("*, events(title)")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("blessings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blessings"] });
      toast({ title: "הסטטוס עודכן בהצלחה" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה בעדכון הסטטוס" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blessings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blessings"] });
      toast({ title: "הברכה נמחקה בהצלחה" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה במחיקת הברכה" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "outline", label: "ממתין" },
      approved: { variant: "default", label: "אושר" },
      rejected: { variant: "destructive", label: "נדחה" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  const pendingBlessings = blessings?.filter((b: any) => b.status === "pending");
  const approvedBlessings = blessings?.filter((b: any) => b.status === "approved");
  const rejectedBlessings = blessings?.filter((b: any) => b.status === "rejected");

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">ניהול ברכות</h2>

      {pendingBlessings && pendingBlessings.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">ברכות ממתינות לאישור ({pendingBlessings.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingBlessings.map((blessing: any) => (
              <Card key={blessing.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{blessing.author_name}</CardTitle>
                      <CardDescription>
                        {blessing.author_relation} • {blessing.events?.title}
                      </CardDescription>
                      <CardDescription>
                        {format(new Date(blessing.submitted_at), "d בMMMM yyyy", { locale: he })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(blessing.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">"{blessing.text}"</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: blessing.id, status: "approved" })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    אשר
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: blessing.id, status: "rejected" })}
                  >
                    <X className="h-4 w-4 mr-1" />
                    דחה
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {approvedBlessings && approvedBlessings.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">ברכות מאושרות ({approvedBlessings.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedBlessings.map((blessing: any) => (
              <Card key={blessing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{blessing.author_name}</CardTitle>
                      <CardDescription>
                        {blessing.author_relation} • {blessing.events?.title}
                      </CardDescription>
                    </div>
                    {getStatusBadge(blessing.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed line-clamp-3">"{blessing.text}"</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("בטוח שרוצה למחוק את הברכה?")) {
                        deleteMutation.mutate(blessing.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rejectedBlessings && rejectedBlessings.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">ברכות שנדחו ({rejectedBlessings.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rejectedBlessings.map((blessing: any) => (
              <Card key={blessing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{blessing.author_name}</CardTitle>
                      <CardDescription>
                        {blessing.author_relation} • {blessing.events?.title}
                      </CardDescription>
                    </div>
                    {getStatusBadge(blessing.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed line-clamp-3">"{blessing.text}"</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: blessing.id, status: "approved" })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    אשר
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("בטוח שרוצה למחוק את הברכה?")) {
                        deleteMutation.mutate(blessing.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
