import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon, Heart, FileText } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { GalleryTab } from "@/components/event/GalleryTab";
import { BlessingsTab } from "@/components/event/BlessingsTab";
import { StoryTab } from "@/components/event/StoryTab";

const Event = () => {
  const { id } = useParams();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">טוען...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">האירוע לא נמצא</h1>
        <Button asChild>
          <Link to="/">
            <ArrowRight className="mr-2 h-4 w-4" />
            חזרה לדף הבית
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Event Header */}
      <section 
        className="relative h-[50vh] flex items-end bg-cover bg-center"
        style={{ backgroundImage: `url(${event.cover_image_url || "/placeholder.svg"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 pb-12 text-white">
          <Button asChild variant="ghost" className="mb-4 text-white hover:bg-white/20">
            <Link to="/">
              <ArrowRight className="mr-2 h-4 w-4" />
              חזרה לדף הבית
            </Link>
          </Button>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {format(new Date(event.date), "d בMMMM yyyy", { locale: he })}
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.location}
              </div>
            )}
          </div>
          {event.description_short && (
            <p className="mt-4 text-lg max-w-3xl font-light">
              {event.description_short}
            </p>
          )}
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="gallery" className="w-full" dir="rtl">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              תמונות
            </TabsTrigger>
            <TabsTrigger value="blessings" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              ברכות
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              הסיפור
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-8">
            <GalleryTab eventId={id!} />
          </TabsContent>

          <TabsContent value="blessings" className="mt-8">
            <BlessingsTab eventId={id!} />
          </TabsContent>

          <TabsContent value="story" className="mt-8">
            <StoryTab story={event.description_full} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Event;
