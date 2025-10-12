import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Heart } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BlessingsTabProps {
  eventId: string;
}

export const BlessingsTab = ({ eventId }: BlessingsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: blessings, isLoading, refetch } = useQuery({
    queryKey: ["blessings", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blessings")
        .select("*")
        .eq("event_id", eventId)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmitBlessing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("blessings").insert({
      event_id: eventId,
      author_name: formData.get("author_name") as string,
      author_relation: formData.get("author_relation") as string,
      text: formData.get("text") as string,
      status: "pending",
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא הצלחנו לשלוח את הברכה, נסה שוב",
      });
      return;
    }

    toast({
      title: "הברכה נשלחה בהצלחה!",
      description: "הברכה תופיע באתר לאחר אישור",
    });

    setIsDialogOpen(false);
    e.currentTarget.reset();
  };

  const filteredBlessings = blessings?.filter(
    (blessing) =>
      blessing.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.author_relation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש ברכות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              הוסף ברכה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>שליחת ברכה</DialogTitle>
              <DialogDescription>
                הברכה תופיע באתר לאחר אישור
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitBlessing} className="space-y-4">
              <div>
                <Label htmlFor="author_name">שם מלא</Label>
                <Input id="author_name" name="author_name" required />
              </div>
              <div>
                <Label htmlFor="author_relation">יחס (משפחה/חבר/עבודה)</Label>
                <Input id="author_relation" name="author_relation" placeholder="לא חובה" />
              </div>
              <div>
                <Label htmlFor="text">הברכה</Label>
                <Textarea id="text" name="text" required rows={5} />
              </div>
              <Button type="submit" className="w-full">שלח ברכה</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!filteredBlessings || filteredBlessings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            {searchTerm ? "לא נמצאו ברכות התואמות לחיפוש" : "עדיין לא הוספו ברכות"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlessings.map((blessing) => (
            <Card key={blessing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {blessing.author_name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{blessing.author_name}</CardTitle>
                    <CardDescription>
                      {blessing.author_relation && `${blessing.author_relation} • `}
                      {format(new Date(blessing.submitted_at), "d בMMMM yyyy", { locale: he })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  "{blessing.text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
