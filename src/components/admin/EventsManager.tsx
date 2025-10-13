import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export const EventsManager = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      console.log("Creating event with data:", formData);
      const { data, error } = await supabase.from("events").insert(formData).select();
      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }
      console.log("Event created successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "האירוע נוצר בהצלחה" });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({ 
        variant: "destructive", 
        title: "שגיאה ביצירת האירוע",
        description: error.message || "אנא נסה שוב"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("events").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "האירוע עודכן בהצלחה" });
      setEditingEvent(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה בעדכון האירוע" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "האירוע נמחק בהצלחה" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה במחיקת האירוע" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const statusValue = formData.get("status") as string;
    const data = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      location: formData.get("location") as string || null,
      cover_image_url: formData.get("cover_image_url") as string || null,
      description_short: formData.get("description_short") as string || null,
      description_full: formData.get("description_full") as string || null,
      status: statusValue as "draft" | "published",
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const EventForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">כותרת</Label>
        <Input id="title" name="title" defaultValue={editingEvent?.title} required />
      </div>
      <div>
        <Label htmlFor="date">תאריך</Label>
        <Input id="date" name="date" type="date" defaultValue={editingEvent?.date} required />
      </div>
      <div>
        <Label htmlFor="location">מיקום</Label>
        <Input id="location" name="location" defaultValue={editingEvent?.location} />
      </div>
      <div>
        <Label htmlFor="cover_image_url">קישור לתמונת רקע</Label>
        <Input id="cover_image_url" name="cover_image_url" defaultValue={editingEvent?.cover_image_url} />
      </div>
      <div>
        <Label htmlFor="description_short">תיאור קצר</Label>
        <Textarea id="description_short" name="description_short" defaultValue={editingEvent?.description_short} rows={3} />
      </div>
      <div>
        <Label htmlFor="description_full">סיפור מלא</Label>
        <Textarea id="description_full" name="description_full" defaultValue={editingEvent?.description_full} rows={6} />
      </div>
      <div>
        <Label htmlFor="status">סטטוס</Label>
        <select
          name="status"
          id="status"
          defaultValue={editingEvent?.status || "draft"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="draft">טיוטה</option>
          <option value="published">פורסם</option>
        </select>
      </div>
      <DialogFooter>
        <Button type="submit">
          {editingEvent ? "עדכן" : "צור"} אירוע
        </Button>
      </DialogFooter>
    </form>
  );

  if (isLoading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ניהול אירועים</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              אירוע חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>יצירת אירוע חדש</DialogTitle>
            </DialogHeader>
            <EventForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {format(new Date(event.date), "d בMMMM yyyy", { locale: he })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description_short || "אין תיאור"}
              </p>
              <p className="text-sm mt-2">
                סטטוס: <span className={event.status === "published" ? "text-green-600" : "text-orange-600"}>
                  {event.status === "published" ? "פורסם" : "טיוטה"}
                </span>
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Dialog open={editingEvent?.id === event.id} onOpenChange={(open) => !open && setEditingEvent(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingEvent(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>עריכת אירוע</DialogTitle>
                  </DialogHeader>
                  <EventForm />
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("בטוח שרוצה למחוק את האירוע?")) {
                    deleteMutation.mutate(event.id);
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
  );
};
