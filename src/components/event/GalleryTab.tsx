import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryTabProps {
  eventId: string;
}

export const GalleryTab = ({ eventId }: GalleryTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ["media", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .eq("event_id", eventId)
        .eq("visible", true)
        .eq("type", "image")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          עדיין לא הועלו תמונות לאירוע זה
        </p>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-border/50"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={item.file_url}
              alt={item.title || item.caption || "תמונה"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
                console.error('Failed to load image:', item.file_url);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 bg-black/98 border-none overflow-hidden">
          {selectedIndex !== null && (
            <div className="relative h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white/90 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={media[selectedIndex].file_url}
                  alt={media[selectedIndex].title || media[selectedIndex].caption || "תמונה"}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    console.error('Failed to load image:', media[selectedIndex].file_url);
                  }}
                />
              </div>

              {(media[selectedIndex].caption || media[selectedIndex].title) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 text-white">
                  {media[selectedIndex].title && (
                    <h3 className="text-2xl font-bold mb-2">{media[selectedIndex].title}</h3>
                  )}
                  {media[selectedIndex].caption && (
                    <p className="text-lg text-white/90">{media[selectedIndex].caption}</p>
                  )}
                </div>
              )}

              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-sm w-12 h-12"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedIndex < media.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white hover:bg-white/10 rounded-full backdrop-blur-sm w-12 h-12"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium">
                {selectedIndex + 1} / {media.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
