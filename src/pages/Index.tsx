import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Heart, Settings } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentBlessings } = useQuery({
    queryKey: ["recent-blessings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blessings")
        .select("*, events(title)")
        .eq("status", "approved")
        .order("submitted_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Admin Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button asChild variant="outline" size="icon" className="rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background">
          <Link to="/admin">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            הסיפור שלנו
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            כל רגע, כל זיכרון, כל ברכה - שמורים כאן לנצח
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          האירועים שלנו
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.cover_image_url || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.date), "d בMMMM yyyy", { locale: he })}
                  </CardDescription>
                  {event.location && (
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {event.description_short}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="default">
                    <Link to={`/event/${event.id}`}>
                      כניסה לאירוע
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              עדיין לא נוספו אירועים
            </p>
            <Button asChild>
              <Link to="/admin">
                הוספת אירוע ראשון
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Recent Blessings */}
      {recentBlessings && recentBlessings.length > 0 && (
        <section className="bg-gradient-to-b from-secondary/30 to-background py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              ברכות אחרונות
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBlessings.map((blessing: any) => (
                <Card key={blessing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{blessing.author_name}</CardTitle>
                    <CardDescription>
                      {blessing.author_relation && `${blessing.author_relation} • `}
                      {blessing.events?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-4 leading-relaxed">
                      "{blessing.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-secondary/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} הסיפור שלנו - כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
