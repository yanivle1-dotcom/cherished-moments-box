import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { GooglePhotosGuide } from "./GooglePhotosGuide";

export const MediaManager = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["events-for-media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("id, title");
      if (error) throw error;
      return data;
    },
  });

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*, events(title)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase.from("media").insert(formData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast({ title: "המדיה נוספה בהצלחה" });
      setIsCreateOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה בהוספת המדיה" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("media").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast({ title: "המדיה עודכנה בהצלחה" });
      setEditingMedia(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה בעדכון המדיה" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast({ title: "המדיה נמחקה בהצלחה" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "שגיאה במחיקת המדיה" });
    },
  });

  const toggleVisibility = (id: string, currentVisibility: boolean) => {
    updateMutation.mutate({ id, data: { visible: !currentVisibility } });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tagsValue = formData.get("tags") as string;
    const data = {
      event_id: formData.get("event_id") as string,
      type: formData.get("type") as string,
      title: (formData.get("title") as string) || null,
      caption: (formData.get("caption") as string) || null,
      file_url: formData.get("file_url") as string,
      thumbnail_url: (formData.get("thumbnail_url") as string) || null,
      tags: tagsValue ? tagsValue.split(",").map((t) => t.trim()) : [],
      visible: true,
    };

    if (editingMedia) {
      updateMutation.mutate({ id: editingMedia.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const MediaForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event_id">אירוע</Label>
          <select
            name="event_id"
            id="event_id"
            required
            defaultValue={editingMedia?.event_id}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">בחר אירוע</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="type">סוג</Label>
          <select
            name="type"
            id="type"
            required
            defaultValue={editingMedia?.type || "image"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="image">תמונה</option>
            <option value="video">וידאו</option>
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="file_url">קישור לקובץ (Google Photos URL)</Label>
        <Input 
          id="file_url" 
          name="file_url" 
          type="url" 
          defaultValue={editingMedia?.file_url} 
          required 
          placeholder="https://lh3.googleusercontent.com/..." 
        />
        <p className="text-xs text-muted-foreground mt-1">
          הדבק כאן את הקישור הישיר לתמונה מ-Google Photos. לחץ לחיצה ימנית על התמונה ובחר "העתק קישור לתמונה"
        </p>
      </div>
      
      <div>
        <Label htmlFor="thumbnail_url">קישור לתמונה ממוזערת (אופציונלי)</Label>
        <Input 
          id="thumbnail_url" 
          name="thumbnail_url" 
          type="url" 
          defaultValue={editingMedia?.thumbnail_url} 
          placeholder="https://lh3.googleusercontent.com/..." 
        />
      </div>
      
      <div>
        <Label htmlFor="title">כותרת (אופציונלי)</Label>
        <Input id="title" name="title" defaultValue={editingMedia?.title} />
      </div>
      
      <div>
        <Label htmlFor="caption">כיתוב (אופציונלי)</Label>
        <Textarea id="caption" name="caption" defaultValue={editingMedia?.caption} rows={3} />
      </div>
      
      <div>
        <Label htmlFor="tags">תגיות (מופרד בפסיקים)</Label>
        <Input 
          id="tags" 
          name="tags" 
          defaultValue={editingMedia?.tags?.join(", ")} 
          placeholder="חופה, משפחה, ריקודים" 
        />
      </div>
      
      <DialogFooter>
        <Button type="submit">
          {editingMedia ? "עדכן" : "הוסף"} מדיה
        </Button>
      </DialogFooter>
    </form>
  );

  if (isLoading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <GooglePhotosGuide />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ניהול מדיה</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              מדיה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>הוספת מדיה</DialogTitle>
            </DialogHeader>
            <MediaForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media?.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={item.file_url}
                  alt={item.title || "media"}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{item.title || "ללא כותרת"}</CardTitle>
              <CardDescription>
                {item.events?.title}
              </CardDescription>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleVisibility(item.id, item.visible)}
              >
                {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Dialog open={editingMedia?.id === item.id} onOpenChange={(open) => !open && setEditingMedia(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingMedia(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>עריכת מדיה</DialogTitle>
                  </DialogHeader>
                  <MediaForm />
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("בטוח שרוצה למחוק את המדיה?")) {
                    deleteMutation.mutate(item.id);
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
